import { BaseService } from '@src/services'
import { IRedisService } from '@src/services/types'

jest.mock('../../db/db')
const { db } = require('../../db/db')

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  updateListItem: jest.fn(),
  removeListItem: jest.fn(),
  addToList: jest.fn(),
} as jest.Mocked<IRedisService>

const mockTable = {
  id: 'id',
  deleted: 'deleted',
  name: 'mockTable',
} as any

describe('BaseService', () => {
  let service: BaseService<typeof mockTable>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new BaseService(mockTable, mockTable.name, mockRedisService)
  })

  describe('getAll', () => {
    it('should return cached data if present without fetching from database', async () => {
      const cachedData = [{ id: 1, name: 'Cached' }]
      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedData))
      const result = await service.getAll()

      expect(result).toEqual(cachedData)
      expect(db.select).not.toHaveBeenCalled()
    })

    it('should fetch from database and cache', async () => {
      const dbData = [{ id: 1, name: 'DB Data' }]
      mockRedisService.get.mockResolvedValue(null)

      const from = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(dbData),
      })
      db.select.mockReturnValue({ from })
      const result = await service.getAll()

      expect(result).toEqual(dbData)
      expect(mockRedisService.set).toHaveBeenCalledWith(
        mockTable.name,
        JSON.stringify(dbData),
      )
    })
  })
})
