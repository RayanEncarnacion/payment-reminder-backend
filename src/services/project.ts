import "dotenv/config";
import { projectsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";

class ProjectService {
  async getAll() {
    return await db.select().from(projectsTable);
  }

  async create(project: typeof projectsTable.$inferInsert) {
    const [{ id }] = await db
      .insert(projectsTable)
      .values(project)
      .$returningId();

    return (
      await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, id))
        .limit(1)
    )[0];
  }
}

export default new ProjectService();
