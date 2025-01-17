import "dotenv/config";
import { usersTable } from "@db/schemas/client";
import { eq } from "drizzle-orm";
import { db } from "@db";

class UserService {
  async createUser(user: typeof usersTable.$inferInsert) {
    const [{ id }] = await db.insert(usersTable).values(user).$returningId();
    return (
      await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)
    )[0];
  }

  async getUsers() {
    return await db.select().from(usersTable);
  }

  async getUserByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0];
  }
}

export default new UserService();
