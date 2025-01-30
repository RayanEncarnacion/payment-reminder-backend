import 'dotenv/config'
import { eq, desc, and } from 'drizzle-orm'
import { db, DBTables } from '@db'
import { type IRedisService } from '@services'

class BaseService<T extends DBTables> {
  table
  redis: IRedisService
  tableName

  constructor(table: DBTables, redisService: IRedisService) {
    this.table = table
    this.redis = redisService
    this.tableName = (table as any)[Symbol.for('drizzle:Name')]
  }

  async existsById(id: number) {
    return !!(await this.getById(id))
  }

  async getAll() {
    const cachedValue = await this.redis.get(this.tableName)

    if (cachedValue) return JSON.parse(cachedValue) as T['$inferSelect'][]
    const values = (await db
      .select()
      .from(this.table)
      .where(eq(this.table.deleted, 0))
      .orderBy(desc(this.table.id))) as T['$inferSelect'][]
    this.redis.set(this.tableName, JSON.stringify(values))

    return values
  }

  async getById(id: number) {
    return (
      await db
        .select()
        .from(this.table)
        .where(and(eq(this.table.id, id), eq(this.table.deleted, 0)))
    )[0] as T['$inferSelect']
  }

  async delete(id: number) {
    const result = await db
      .update(this.table)
      .set({ deleted: 1 })
      .where(eq(this.table.id, id))

    if (!result.length) return
    this.redis.removeListItem(this.tableName, 'id', id)
  }

  async update(id: number, payload: any) {
    await db
      .update(this.table)
      .set(payload)
      .where(and(eq(this.table.id, id), eq(this.table.deleted, 0)))

    const updatedRow = await this.getById(id)

    if (!updatedRow) return
    this.redis.updateListItem(this.tableName, 'id', id, updatedRow)

    return updatedRow
  }

  async create(payload: T['$inferInsert']) {
    const [{ id }] = await db.insert(this.table).values(payload).$returningId()
    const insertedRow = await this.getById(id)
    this.redis.addToList(this.tableName, insertedRow)

    return insertedRow
  }
}

export default BaseService
