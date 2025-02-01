import { eq } from 'drizzle-orm'
import { db, usersTable } from '@db'
import { RedisService, BaseService } from '@services'

class UserService extends BaseService<typeof usersTable> {
  async getByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0]
  }
}

export default new UserService(usersTable, RedisService)
