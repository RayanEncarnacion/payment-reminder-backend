import 'dotenv/config'
import { eq, and, lt } from 'drizzle-orm'
import {
  db,
  clientsTable,
  paymentsTable,
  projectDatesTable,
  projectsTable,
} from '@db'
import { BaseService, RedisService, MailService } from '@services'
import { correctUTCDate } from '@utils'
import { updateProjectPayload } from '@validation/schemas'

class ProjectService extends BaseService<typeof projectsTable> {
  async create(
    project: typeof projectsTable.$inferInsert & { dates: number[] },
  ) {
    const projectId = await db.transaction(async (tx) => {
      const [{ id: projectId }] = await tx
        .insert(projectsTable)
        .values(project)
        .$returningId()

      project.dates.forEach(
        async (day) =>
          await tx.insert(projectDatesTable).values({
            projectId,
            day,
            createdBy: project.createdBy,
          }),
      )
      return projectId
    })

    return await super.getById(projectId)
  }

  async update(id: number, project: updateProjectPayload) {
    return await db.transaction(async (tx) => {
      await tx
        .update(projectsTable)
        .set({
          active: project.active,
          amount: project.amount.toFixed(2),
          name: project.name,
        })
        .where(and(eq(projectsTable.id, id), eq(projectsTable.deleted, 0)))

      const projectRow = await super.getById(id)

      await tx
        .update(projectDatesTable)
        .set({ deleted: 1 })
        .where(eq(projectDatesTable.projectId, id))

      project.dates.forEach(
        async (day) =>
          await tx.insert(projectDatesTable).values({
            day,
            projectId: id,
            createdBy: projectRow.createdBy,
          }),
      )

      return projectRow
    })
  }

  async getByName(name: string) {
    return (
      await db.select().from(projectsTable).where(eq(projectsTable.name, name))
    )[0]
  }

  async generatePayments() {
    const projectsToGeneratePayment = await db
      .select({
        id: projectsTable.id,
        amount: projectsTable.amount,
        day: projectDatesTable.day,
      })
      .from(projectsTable)
      .innerJoin(
        projectDatesTable,
        eq(projectsTable.id, projectDatesTable.projectId),
      )
      .where(
        and(
          eq(projectDatesTable.day, new Date().getDate() + 5),
          eq(projectsTable.deleted, 0),
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
        project: projectsTable.name,
        amount: paymentsTable.amount,
        dueDate: paymentsTable.dueDate,
      })
      .from(paymentsTable)
      .innerJoin(projectsTable, eq(projectsTable.id, paymentsTable.projectId))
      .innerJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .where(
        and(
          lt(paymentsTable.dueDate, new Date()),
          eq(paymentsTable.payed, 0),
          eq(projectsTable.deleted, 0),
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

export default new ProjectService(projectsTable, RedisService)
