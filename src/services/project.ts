import 'dotenv/config'
import { eq, and, lt } from 'drizzle-orm'
import { db } from '@db'
import {
  clientsTable,
  paymentsTable,
  projectDatesTable,
  projectsTable,
} from '@db/schemas'
import MailService from '@services/mail'
import { correctUTCDate } from '@utils'
import { updateProjectPayload } from '@validation/schemas'
import { BaseService } from './base'

class ProjectService extends BaseService<typeof projectsTable> {
  #table

  constructor(table: typeof projectsTable) {
    super(table)
    this.#table = table
  }

  async getAll() {
    return await super.getAll()
  }

  async create(
    project: typeof projectsTable.$inferInsert & { dates: number[] },
  ) {
    const projectId = await db.transaction(async (tx) => {
      const [{ id: projectId }] = await tx
        .insert(this.#table)
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

  async delete(id: number) {
    await super.delete(id)
  }

  async update(id: number, project: updateProjectPayload) {
    await db
      .update(projectsTable)
      .set({
        name: project.name,
        active: +project.active,
      })
      .where(eq(projectsTable.id, id))
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

export default new ProjectService(projectsTable)
