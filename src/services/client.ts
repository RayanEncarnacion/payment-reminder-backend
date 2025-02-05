import { eq, and, or } from 'drizzle-orm'
import { db, clientsTable, projectsTable } from '@src/db'
import { BaseService, IRedisService, RedisService } from '@src/services'

export class ClientService extends BaseService<typeof clientsTable> {
  table: typeof clientsTable
  _projectsTable: typeof projectsTable
  redis: IRedisService
  tableName: string

  constructor(
    table: typeof clientsTable,
    tableName: string,
    _projectsTable: typeof projectsTable,
    redisService: IRedisService,
  ) {
    super(table, tableName, redisService)
    this.table = table
    this.tableName = tableName
    this._projectsTable = _projectsTable
    this.redis = redisService
  }

  async getByEmail(email: string) {
    return (
      await db
        .select()
        .from(this.table)
        .where(eq((this.table as any).email, email))
    )[0]
  }

  async delete(id: number) {
    await db.transaction(async (tx) => {
      await tx
        .update(this.table)
        .set({ deleted: 1 })
        .where(eq(this.table.id, id))

      await tx
        .update(this._projectsTable)
        .set({ deleted: 1 })
        .where(eq(this._projectsTable.clientId, id))
    })

    this.redis.removeListItem('clients', 'id', id)
  }

  async getWithProjects(id: number) {
    return await db
      .select()
      .from(this._projectsTable)
      .where(
        and(
          eq(this._projectsTable.clientId, id),
          eq(this._projectsTable.deleted, 0),
        ),
      )
  }

  async getByNameOrEmail(name: string, email: string) {
    return await db
      .select()
      .from(this.table)
      .where(or(eq(this.table.email, email), eq(this.table.name, name)))
  }
}

export default new ClientService(
  clientsTable,
  'clients',
  projectsTable,
  RedisService,
)
