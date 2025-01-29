import { redisClient } from '@db/redis'

export interface IRedisService {
  get(key: string): Promise<string | null>
  set(key: string, value: any, options?: { EX: number }): void
  addToList(key: string, value: any): void
  removeFromList(listKey: string, identifier: any, identifierValue: any): void
}

class RedisService implements IRedisService {
  async get(key: string) {
    return await redisClient.get(key)
  }

  async set(key: string, value: any, options: { EX: number } = { EX: 300 }) {
    redisClient.set(key, JSON.stringify(value), options)
  }

  async addToList(key: string, value: any) {
    const values = (await redisClient.get(key)) || '[]'

    redisClient.set(key, JSON.stringify([value, ...JSON.parse(values)]), {
      EX: 300,
    })
  }

  async removeFromList(listKey: string, identifier: any, identifierValue: any) {
    const cachedList = JSON.parse((await redisClient.get(listKey)) || '[]')

    if (!Array.isArray(cachedList))
      throw new Error('Key provided does not contain a list')

    const updatedValues = cachedList.filter(
      (value: any) => value[identifier] !== identifierValue,
    )
    redisClient.set(listKey, JSON.stringify(updatedValues), {
      EX: 300,
    })
  }
}

export default new RedisService()
