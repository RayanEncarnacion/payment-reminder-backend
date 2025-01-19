import "dotenv/config";
import { projectsTable } from "@db/schemas";
import { db } from "@db";

class ProjectService {
  async getAll() {
    return await db.select().from(projectsTable);
  }
}

export default new ProjectService();
