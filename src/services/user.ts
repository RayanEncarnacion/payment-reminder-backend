import { eq, getTableName } from 'drizzle-orm'
import { db, usersTable } from '@src/db'
import { RedisService, BaseService } from '@src/services'
import { comparePassword } from '@src/utils/encryption'

export class UserService extends BaseService<typeof usersTable> {
  async getByEmail(email: string) {
    return (
      await db.select().from(this.table).where(eq(this.table.email, email))
    )[0]
  }

  async getByCredentials(email: string, password: string) {
    const user = await this.getByEmail(email)

    if (!user || !(await comparePassword(password, user.passwordHash)))
      return null

    return user
  }
}

export default new UserService(
  usersTable,
  getTableName(usersTable),
  RedisService,
)
