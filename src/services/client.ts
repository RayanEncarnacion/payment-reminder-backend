import { eq, and, or } from 'drizzle-orm'
import { db, clientsTable, projectsTable } from '@src/db'
import { BaseService, RedisService } from '@src/services'

class ClientService extends BaseService<typeof clientsTable> {
  async getByEmail(email: string) {
    return (
      await db.select().from(clientsTable).where(eq(clientsTable.email, email))
    )[0]
  }

  async delete(id: number) {
    await db.transaction(async (tx) => {
      await tx
        .update(clientsTable)
        .set({ deleted: 1 })
        .where(eq(clientsTable.id, id))

      await tx
        .update(projectsTable)
        .set({ deleted: 1 })
        .where(eq(projectsTable.clientId, id))
    })

    this.redis.removeListItem('clients', 'id', id)
  }

  async getWithProjects(id: number) {
    return await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.clientId, id), eq(projectsTable.deleted, 0)))
  }

  async getByNameOrEmail(name: string, email: string) {
    return await db
      .select()
      .from(clientsTable)
      .where(or(eq(clientsTable.email, email), eq(clientsTable.name, name)))
  }
}

export default new ClientService(clientsTable, 'clients', RedisService)
