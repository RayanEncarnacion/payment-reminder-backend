import "dotenv/config";
import { DBTables } from "@db/schemas";
import { AnyTable, eq, Table } from "drizzle-orm";
import { db } from "@db";
import { clientsTable } from "@db/schemas";

// TODO: Implement basic operations in base (getById, getAll, ect.)
export class BaseService<T extends DBTables> {
  #table;

  constructor(table: DBTables) {
    this.#table = table;
  }

  async existsById(id: number) {
    return !!(await this.getById(id));
  }

  async getAll() {
    return await db.select().from(this.#table);
  }

  async getById(id: number) {
    return (
      await db.select().from(this.#table).where(eq(this.#table.id, id)).limit(1)
    )[0];
  }

  async delete(id: number) {
    await db
      .update(this.#table)
      .set({ deleted: 1 })
      .where(eq(this.#table.id, id));
  }

  async update(id: number, payload: any) {
    await db.update(this.#table).set(payload).where(eq(this.#table.id, id));
  }

  async create(payload: T["$inferInsert"]) {
    const [{ id }] = (await db
      .insert(this.#table)
      .values(payload)
      .$returningId()) as any;

    return await this.getById(id);
  }
}
