import "dotenv/config";
import { DBTables } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";

// TODO: Implement basic operations in base (getById, getAll, ect.)
export class BaseService {
  async existsById(id: number, table: DBTables) {
    const row = (
      await db.select().from(table).where(eq(table.id, id)).limit(1)
    )[0];

    return !!row;
  }
}
