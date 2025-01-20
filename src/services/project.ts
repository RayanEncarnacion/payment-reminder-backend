import "dotenv/config";
import { projectsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { updateProjectPayload } from "@validation/schemas";
import { BaseService } from "./base";

class ProjectService extends BaseService<typeof projectsTable> {
  constructor() {
    super(projectsTable);
  }

  async getAll() {
    return await super.getAll();
  }

  async create(project: typeof projectsTable.$inferInsert) {
    return await super.create(project);
  }

  async delete(id: number) {
    await super.delete(id);
  }

  async update(id: number, project: updateProjectPayload) {
    await db
      .update(projectsTable)
      .set({
        name: project.name,
        active: +project.active,
      })
      .where(eq(projectsTable.id, id));
  }

  async getByName(name: string) {
    return (
      await db.select().from(projectsTable).where(eq(projectsTable.name, name))
    )[0];
  }
}

export default new ProjectService();
