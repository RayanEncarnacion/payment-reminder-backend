import { RedisClientType } from 'redis'
import { redisClient } from '@src/db'
import { type IRedisService } from '@src/services'

export class RedisService<T extends RedisClientType<any, any, any>>
  implements IRedisService
{
  private redis: T

  constructor(redisClient: T) {
    this.redis = redisClient
  }

  async get(key: string) {
    return await this.redis.get(key)
  }

  async remove(key: string) {
    return await this.redis.del(key)
  }

  async set(key: string, value: string, options: { EX: number } = { EX: 300 }) {
    return this.redis.set(key, value, options)
  }

  async addToList(key: string, value: any) {
    const values = (await this.redis.get(key)) || '[]'

    return this.redis.set(key, JSON.stringify([value, ...JSON.parse(values)]))
  }

  // eslint-disable-next-line no-unused-vars
  async updateList(listKey: string, filterFn: (list: any[]) => any[]) {
    const cachedList = await this.redis.get(listKey)

    if (!cachedList) return
    const updatedList = filterFn(JSON.parse(cachedList))
    return this.redis.set(listKey, JSON.stringify(updatedList))
  }

  async updateListItem(
    listKey: string,
    identifier: string,
    identifierValue: any,
    newValue: any,
  ) {
    const filterFn = (list: any[]) =>
      list.map((value: any) =>
        value[identifier] === identifierValue ? newValue : value,
      )

    return this.updateList(listKey, filterFn)
  }

  async removeListItem(listKey: string, identifier: any, identifierValue: any) {
    const filterFn = (list: any[]) =>
      list.filter((value: any) => value[identifier] !== identifierValue)

    return this.updateList(listKey, filterFn)
  }
}

export default new RedisService(redisClient)
