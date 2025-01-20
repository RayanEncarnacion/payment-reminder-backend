import "dotenv/config";
import { usersTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { BaseService } from "./base";

class UserService extends BaseService<typeof usersTable> {
  async create(user: typeof usersTable.$inferInsert) {
    return await super.create(user);
  }

  async getUsers() {
    return await super.getAll();
  }

  async getUserByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0];
  }
}

export default new UserService(usersTable);
