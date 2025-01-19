import "dotenv/config";
import { clientsTable, projectsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { updateClientPayload } from "@validation/schemas";

class ClientService {
  async create(client: typeof clientsTable.$inferInsert) {
    const [{ id }] = await db
      .insert(clientsTable)
      .values(client)
      .$returningId();

    return (
      await db
        .select()
        .from(clientsTable)
        .where(eq(clientsTable.id, id))
        .limit(1)
    )[0];
  }

  async getAll() {
    return await db.select().from(clientsTable);
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

  async update(id: number, client: updateClientPayload) {
    await db
      .update(clientsTable)
      .set({
        name: client.name,
        email: client.email,
        active: +client.active,
      })
      .where(eq(clientsTable.id, id));
  }

  async getProjectsById(id: number) {
    return await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.clientId, id));
  }
}

export default new ClientService();
