import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '@db'
import { usersTable } from '@db/schemas'
import { RedisService, IRedisService } from '@services'
import { BaseService } from './base'

class UserService extends BaseService<typeof usersTable> {
  redis: IRedisService

  constructor(table: typeof usersTable, redisService: IRedisService) {
    super(table)
    this.redis = redisService
  }

  async create(user: typeof usersTable.$inferInsert) {
    const createdUser = await super.create(user)
    this.redis.addToList('users', createdUser)

    return createdUser
  }

  // TODO: Implement caching on base service (getAll, delete and update)
  async getAll() {
    const cachedValue = await this.redis.get('users')
    if (cachedValue)
      return JSON.parse(cachedValue) as (typeof usersTable.$inferSelect)[]

    const users = await super.getAll()
    this.redis.set('users', JSON.stringify(users))

    return users
  }

  async getByEmail(email: string) {
    return (
      await db.select().from(usersTable).where(eq(usersTable.email, email))
    )[0]
  }
}

export default new UserService(usersTable, RedisService)
