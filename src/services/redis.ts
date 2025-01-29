import { redisClient } from '@db/redis'
import { IRedisService } from '@services/types'

class RedisService implements IRedisService {
  async get(key: string) {
    return await redisClient.get(key)
  }

  async remove(key: string) {
    return await redisClient.del(key)
  }

  async set(key: string, value: string, options: { EX: number } = { EX: 300 }) {
    redisClient.set(key, value, options)
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
