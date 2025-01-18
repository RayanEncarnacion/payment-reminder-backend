import "dotenv/config";
import { clientsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";

class ClientService {
  async createClient(client: typeof clientsTable.$inferInsert) {
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

  async getClients() {
    return await db.select().from(clientsTable);
  }

  async getClientByEmail(email: string) {
    return (
      await db.select().from(clientsTable).where(eq(clientsTable.email, email))
    )[0];
  }

  async deleteClient(id: number) {
    await db
      .update(clientsTable)
      .set({ deleted: 1 })
      .where(eq(clientsTable.id, id));
  }
}

export default new ClientService();
