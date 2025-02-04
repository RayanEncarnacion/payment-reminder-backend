import { redisClient } from '@src/db'
import { type IRedisService } from '@src/services'

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

  // eslint-disable-next-line no-unused-vars
  private async updateList(listKey: string, filterFn: (list: any[]) => any[]) {
    const cachedList = await redisClient.get(listKey)

    if (!cachedList) return
    const updatedList = filterFn(JSON.parse(cachedList))
    redisClient.set(listKey, JSON.stringify(updatedList), { EX: 300 })
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

    this.updateList(listKey, filterFn)
  }

  async removeListItem(listKey: string, identifier: any, identifierValue: any) {
    const filterFn = (list: any[]) =>
      list.filter((value: any) => value[identifier] !== identifierValue)

    this.updateList(listKey, filterFn)
  }
}

export default new RedisService()
