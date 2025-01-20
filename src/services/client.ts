import "dotenv/config";
import { clientsTable, projectsTable } from "@db/schemas";
import { eq, or } from "drizzle-orm";
import { db } from "@db";
import { updateClientPayload } from "@validation/schemas";
import { BaseService } from "./base";

class ClientService extends BaseService<typeof clientsTable> {
  constructor() {
    super(clientsTable);
  }

  async existsById(id: number) {
    return await super.existsById(id);
  }

  async create(client: typeof clientsTable.$inferInsert) {
    return await super.create(client);
  }

  async getAll() {
    return await super.getAll();
  }

  async getByEmail(email: string) {
    return (
      await db.select().from(clientsTable).where(eq(clientsTable.email, email))
    )[0];
  }

  async delete(id: number) {
    await db
      .update(clientsTable)
      .set({ deleted: 1 })
      .where(eq(clientsTable.id, id));
  }

  async update(id: number, payload: updateClientPayload) {
    await super.update(id, payload);
  }

  async getProjectsById(id: number) {
    return await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.clientId, id));
  }

  async getById(id: number) {
    return super.getById(id);
  }

  async getByNameOrEmail(name: string, email: string) {
    return await db
      .select()
      .from(clientsTable)
      .where(or(eq(clientsTable.email, email), eq(clientsTable.name, name)));
  }
}

export default new ClientService();
