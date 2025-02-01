import 'dotenv/config'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { clientsTable, db, paymentsTable, projectsTable } from '@db'
import { RedisService, BaseService } from '@services'

class PaymentService extends BaseService<typeof paymentsTable> {
  async getWithDates() {
    return await db
      .select({
        payment: {
          ...getTableColumns(paymentsTable),
          isDue: sql<boolean>`${paymentsTable.dueDate} < CURDATE()`.as('isDue'),
        },
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
  }
}

export default new PaymentService(paymentsTable, RedisService)
