import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '@db'
import { usersTable } from '@db/schemas'
import { RedisService, BaseService } from '@services'

class UserService extends BaseService<typeof usersTable> {
  async create(user: typeof usersTable.$inferInsert) {
    return await super.create(user)
  }

  async getAll() {
    return await super.getAll()
  }

  async getByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0]
  }
}

export default new UserService(usersTable, RedisService)
