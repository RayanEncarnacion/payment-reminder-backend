import { SetOptions } from 'redis'
import { redisClient } from '@db/redis'

export interface IRedisService {
  get(key: string): Promise<string | null>
  set(key: string, value: any, options?: SetOptions): void
  addToList(key: string, value: any): void
}

class RedisService implements IRedisService {
  async get(key: string) {
    return await redisClient.get(key)
  }

  async set(key: string, value: any, options: SetOptions = { EX: 300 }) {
    redisClient.set(key, JSON.stringify(value), options)
  }

  async addToList(key: string, value: any) {
    const values = (await redisClient.get(key)) || '[]'

    redisClient.set(key, JSON.stringify([value, ...JSON.parse(values)]), {
      EX: 300,
    })
  }
}

export default new RedisService()
