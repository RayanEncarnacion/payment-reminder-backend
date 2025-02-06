import { eq, and, or, getTableName, sql } from 'drizzle-orm'
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
    const deleted = await db.transaction(async (tx) => {
      const result = await tx
        .update(this.table)
        .set({ deleted: 1 })
        .where(eq(this.table.id, id))

      if (!result.length) return

      await tx
        .update(this._projectsTable)
        .set({ deleted: 1 })
        .where(eq(this._projectsTable.clientId, id))

      return true
    })

    if (!deleted) return
    this.redis.removeListItem(this.tableName, 'id', id)
    return deleted
  }

  async getWithProjects(id: number) {
    return (
      await db
        .select({
          ...(this.table as any),
          projects: sql`
                CASE
                  WHEN COUNT(${this._projectsTable.id}) = 0 THEN NULL
                  ELSE JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', ${this._projectsTable.id},
                        'name', ${this._projectsTable.name},
                        'amount', ${this._projectsTable.amount},
                        'active', ${this._projectsTable.active},
                        'createdAt', ${this._projectsTable.createdAt}
                      )
                    )
                END`,
        })
        .from(this.table)
        .innerJoin(
          this._projectsTable,
          eq(this._projectsTable.clientId, this.table.id),
        )
        .where(
          and(
            eq(this.table.id, id),
            eq(this.table.deleted, 0),
            eq(this._projectsTable.deleted, 0),
          ),
        )
    )[0]
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
  getTableName(clientsTable),
  projectsTable,
  RedisService,
)
