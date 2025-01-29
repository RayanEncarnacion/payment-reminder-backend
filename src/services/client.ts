import 'dotenv/config'
import { eq, and, or } from 'drizzle-orm'
import { db } from '@db'
import { clientsTable, projectsTable } from '@db/schemas'
import { RedisService } from '@services'
import { updateClientPayload } from '@validation/schemas'
import { BaseService } from './base'
import { IRedisService } from './redis'

class ClientService extends BaseService<typeof clientsTable> {
  redis: IRedisService

  constructor(table: typeof clientsTable, redisService: IRedisService) {
    super(table)
    this.redis = redisService
  }

  async existsById(id: number) {
    return await super.existsById(id)
  }

  async create(client: typeof clientsTable.$inferInsert) {
    const createdClient = await super.create(client)
    this.redis.addToList('clients', createdClient)

    return createdClient
  }

  async getAll() {
    const cachedValue = await this.redis.get('clients')

    if (cachedValue)
      return JSON.parse(cachedValue) as (typeof clientsTable.$inferSelect)[]

    const clients = await super.getAll()
    this.redis.set('clients', JSON.stringify(clients))

    return clients
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
  }

  async update(id: number, payload: updateClientPayload) {
    await super.update(id, payload)
  }

  async getProjectsById(id: number) {
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
