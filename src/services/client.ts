import 'dotenv/config'
import { eq, and, or } from 'drizzle-orm'
import { db, clientsTable, projectsTable } from '@db'
import { BaseService, RedisService } from '@services'
import { updateClientPayload } from '@validation/schemas'

class ClientService extends BaseService<typeof clientsTable> {
  async existsById(id: number) {
    return await super.existsById(id)
  }

  async create(client: typeof clientsTable.$inferInsert) {
    const createdClient = await super.create(client)
    this.redis.addToList('clients', createdClient)

    return createdClient
  }

  async getAll() {
    return await super.getAll()
  }

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

  async update(id: number, payload: updateClientPayload) {
    return await super.update(id, payload)
  }

  async getWithProjects(id: number) {
    return await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.clientId, id), eq(projectsTable.deleted, 0)))
  }

  async getById(id: number) {
    return await super.getById(id)
  }

  async getByNameOrEmail(name: string, email: string) {
    return await db
      .select()
      .from(clientsTable)
      .where(or(eq(clientsTable.email, email), eq(clientsTable.name, name)))
  }
}

export default new ClientService(clientsTable, RedisService)
