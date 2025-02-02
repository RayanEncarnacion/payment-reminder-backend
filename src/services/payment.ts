import { eq, getTableColumns, sql } from 'drizzle-orm'
import { StatusCodes } from 'http-status-codes'
import { clientsTable, db, paymentsTable, projectsTable } from '@db'
import { RedisService, BaseService } from '@services'
import { PaymentData } from '@types'
import { APIError } from '@utils/classes'

class PaymentService extends BaseService<typeof paymentsTable> {
  getWithDates = async (): Promise<PaymentData[]> => {
    const cachedValue = await this.redis.get(this.tableName)

    if (cachedValue) return JSON.parse(cachedValue)
    const payments = await db
      .select({
        ...getTableColumns(paymentsTable),
        isDue: sql<boolean>`${paymentsTable.dueDate} < CURDATE()`,
        project: {
          id: projectsTable.id,
          name: projectsTable.name,
          active: projectsTable.active,
          deleted: projectsTable.deleted,
        },
        client: {
          id: clientsTable.id,
          name: clientsTable.name,
          email: clientsTable.email,
          active: clientsTable.active,
          deleted: clientsTable.deleted,
        },
      })
      .from(paymentsTable)
      .leftJoin(projectsTable, eq(paymentsTable.projectId, projectsTable.id))
      .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .groupBy(paymentsTable.id)
      .execute()

    this.redis.set(this.tableName, JSON.stringify(payments))

    return payments as PaymentData[]
  }

  markAsPayed = async (id: number) => {
    const payment = this.getById(id)

    if (!payment) throw new APIError(StatusCodes.NOT_FOUND, 'Payment not found')

    await db
      .update(paymentsTable)
      .set({ payed: 1 })
      .where(eq(paymentsTable.id, id))

    const cachedPayments = await this.redis.get(this.tableName)

    if (!cachedPayments) return
    const currentPayment = (JSON.parse(cachedPayments) as PaymentData[]).find(
      (payment) => payment.id === id,
    )

    if (!currentPayment) return
    this.redis.updateListItem(this.tableName, 'id', id, {
      ...currentPayment,
      payed: 1,
      isDue: 0,
    })
  }
}

export default new PaymentService(paymentsTable, RedisService)
