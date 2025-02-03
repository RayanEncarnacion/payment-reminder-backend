import { eq } from 'drizzle-orm'
import { db, usersTable } from '@db'
import { RedisService, BaseService } from '@services'
import { comparePassword } from '@utils/encryption'

class UserService extends BaseService<typeof usersTable> {
  async getByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0]
  }

  async getByCredentials(email: string, password: string) {
    const user = await this.getByEmail(email)

    if (!user || !(await comparePassword(password, user.passwordHash)))
      return null

    return user
  }
}

export default new UserService(usersTable, RedisService)
