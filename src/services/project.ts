import { eq, and, lt, sql, getTableName } from 'drizzle-orm'
import {
  db,
  clientsTable,
  paymentsTable,
  projectDatesTable,
  projectsTable,
} from '@src/db'
import {
  BaseService,
  RedisService,
  MailService,
  IRedisService,
} from '@src/services'
import { correctUTCDate } from '@src/utils'
import { updateProjectPayload } from '@src/validation/schemas'

export class ProjectService extends BaseService<typeof projectsTable> {
  table: typeof projectsTable
  _projectDates: typeof projectDatesTable
  redis: IRedisService
  tableName: string

  constructor(
    table: typeof projectsTable,
    tableName: string,
    _projectDates: typeof projectDatesTable,
    redisService: IRedisService,
  ) {
    super(table, tableName, redisService)
    this.table = table
    this.tableName = tableName
    this._projectDates = _projectDates
    this.redis = redisService
  }

  async getWithDates() {
    return await db
      .select({
        ...(projectsTable as any),
        dates: sql`
          CASE
            WHEN COUNT(${this._projectDates.id}) = 0 THEN NULL
            ELSE JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', ${this._projectDates.id},
                  'projectId', ${this._projectDates.projectId},
                  'day', ${this._projectDates.day}
                )
              )
          END`,
      })
      .from(this.table)
      .leftJoin(
        this._projectDates,
        eq(this._projectDates.projectId, this.table.id),
      )
      .where(and(eq(this.table.deleted, 0), eq(this._projectDates.deleted, 0)))
      .groupBy(this.table.id)
      .execute()
  }

  async create(
    project: typeof projectsTable.$inferInsert & { dates: number[] },
  ) {
    const projectId = await db.transaction(async (tx) => {
      const [{ id: projectId }] = await tx
        .insert(this.table)
        .values(project)
        .$returningId()

      project.dates.forEach(
        async (day) =>
          await tx.insert(this._projectDates).values({
            projectId,
            day,
            createdBy: project.createdBy,
          }),
      )
      return projectId
    })

    const insertedRow = await super.getById(projectId)
    this.redis.addToList(this.tableName, insertedRow)

    return insertedRow
  }

  async update(id: number, project: updateProjectPayload) {
    return await db.transaction(async (tx) => {
      await tx
        .update(this.table)
        .set({
          active: project.active,
          amount: project.amount.toFixed(2),
          name: project.name,
        })
        .where(and(eq(this.table.id, id), eq(this.table.deleted, 0)))

      await tx
        .update(this._projectDates)
        .set({ deleted: 1 })
        .where(eq(this._projectDates.projectId, id))

      const projectRow = await super.getById(id)

      project.dates.forEach(
        async (day) =>
          await tx.insert(this._projectDates).values({
            day,
            projectId: id,
            createdBy: projectRow.createdBy,
          }),
      )

      this.redis.updateListItem(this.tableName, 'id', id, projectRow)

      return projectRow
    })
  }

  async getByName(name: string) {
    return (
      await db.select().from(this.table).where(eq(this.table.name, name))
    )[0]
  }

  async generatePayments() {
    const projectsToGeneratePayment = await db
      .select({
        id: this.table.id,
        amount: this.table.amount,
        day: this._projectDates.day,
      })
      .from(this.table)
      .innerJoin(
        this._projectDates,
        eq(this.table.id, this._projectDates.projectId),
      )
      .where(
        and(
          eq(this._projectDates.day, new Date().getDate() + 5),
          eq(this.table.deleted, 0),
        ),
      )

    await db.transaction(async (tx) => {
      projectsToGeneratePayment.forEach(async ({ id, amount, day }) => {
        const dueDate = getDueDate(day)
        const alreadyHasPayment = (
          await tx
            .select()
            .from(paymentsTable)
            .where(
              and(
                eq(paymentsTable.projectId, id),
                eq(paymentsTable.dueDate, dueDate),
              ),
            )
        )[0]

        if (alreadyHasPayment) return

        await tx.insert(paymentsTable).values({
          amount,
          dueDate,
          projectId: id,
        })
      })
    })
  }

  async sendOverduePaymentsEmails() {
    const overduePayments = await db
      .select({
        client: clientsTable.name,
        email: clientsTable.email,
        project: this.table.name,
        amount: paymentsTable.amount,
        dueDate: paymentsTable.dueDate,
      })
      .from(paymentsTable)
      .innerJoin(this.table, eq(this.table.id, paymentsTable.projectId))
      .innerJoin(clientsTable, eq(this.table.clientId, clientsTable.id))
      .where(
        and(
          lt(paymentsTable.dueDate, new Date()),
          eq(paymentsTable.payed, 0),
          eq(this.table.deleted, 0),
        ),
      )

    overduePayments.forEach((row) => {
      MailService.send({
        ...row,
        dueDate: correctUTCDate(row.dueDate).toLocaleDateString(),
      })
    })
  }
}

function getDueDate(day: number) {
  const currentDate = new Date()
  return new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
}

export default new ProjectService(
  projectsTable,
  getTableName(projectsTable),
  projectDatesTable,
  RedisService,
)
