import { RedisService } from '../redis'

jest.mock('../../db')
const { redisClient } = require('../../db')

describe('RedisService', () => {
  let service: RedisService<any>
  const OK = 'OK'
  const KEY = 'key'

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RedisService(redisClient)
  })

  // TODO: Test updateList, updateListItem and removeListItem methods
  describe('addToList', () => {
    it('should add key-value pair to cache', async () => {
      const value = 'newValue'
      const cachedValues = '["cachedValue"]'

      redisClient.get.mockResolvedValue(cachedValues)
      redisClient.set.mockResolvedValue(OK)

      const result = await service.addToList(KEY, value)

      expect(result).toEqual(OK)
      expect(redisClient.get).toHaveBeenCalledTimes(1)
      expect(redisClient.set).toHaveBeenCalledWith(
        KEY,
        JSON.stringify([value, ...JSON.parse(cachedValues)]),
      )
    })
  })

  describe('updateList', () => {
    it('should update cached list', async () => {
      const cachedList = '[1]'
      const updatedList = [1, 2]
      const filterFn = jest.fn().mockReturnValue(updatedList)
      redisClient.get.mockResolvedValue(cachedList)
      redisClient.set.mockResolvedValue(OK)

      const result = await service.updateList(KEY, filterFn)

      expect(result).toEqual(OK)
      expect(filterFn).toHaveBeenCalledWith(JSON.parse(cachedList))
      expect(redisClient.set).toHaveBeenCalledWith(
        KEY,
        JSON.stringify(updatedList),
      )
    })
  })

  describe('updateListItem', () => {
    it('should add item to a cached list', async () => {
      const newValue = { id: 1, name: 'new' }
      redisClient.get.mockResolvedValue('[{ "id": 1, "name": "old" }]')
      redisClient.set.mockResolvedValue(OK)

      const result = await service.updateListItem(KEY, 'id', 1, newValue)

      expect(result).toEqual(OK)
      expect(redisClient.set).toHaveBeenCalledWith(
        KEY,
        JSON.stringify([newValue]),
      )
    })
  })

  describe('removeListItem', () => {
    it('should remove item from a cached list', async () => {
      redisClient.get.mockResolvedValue('[{ "id": 1, "name": "old" }]')
      redisClient.set.mockResolvedValue(OK)

      const result = await service.removeListItem(KEY, 'id', 1)

      expect(result).toEqual(OK)
      expect(redisClient.set).toHaveBeenCalledWith(KEY, JSON.stringify([]))
    })
  })
})
