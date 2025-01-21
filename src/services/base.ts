import 'dotenv/config'
import { eq, and } from 'drizzle-orm'
import { db } from '@db'
import { DBTables } from '@db/schemas'

// TODO: Implement basic operations in base (getById, getAll, ect.)
export class BaseService<T extends DBTables> {
  #table

  constructor(table: DBTables) {
    this.#table = table
  }

  async existsById(id: number) {
    return !!(await this.getById(id))
  }

  async getAll() {
    return await db.select().from(this.#table).where(eq(this.#table.deleted, 0))
  }

  async getById(id: number) {
    return (
      await db
        .select()
        .from(this.#table)
        .where(and(eq(this.#table.id, id), eq(this.#table.deleted, 0)))
        .limit(1)
    )[0]
  }

  async delete(id: number) {
    await db
      .update(this.#table)
      .set({ deleted: 1 })
      .where(eq(this.#table.id, id))
  }

  async update(id: number, payload: any) {
    await db
      .update(this.#table)
      .set(payload)
      .where(and(eq(this.#table.id, id), eq(this.#table.deleted, 0)))
  }

  async create(payload: T['$inferInsert']) {
    const [{ id }] = (await db
      .insert(this.#table)
      .values(payload)
      .$returningId()) as any

    return await this.getById(id)
  }
}
