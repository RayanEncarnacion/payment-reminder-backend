import { BaseService } from '@src/services'
import { getMockTable, mockRedisService } from '../mocks/RedisService'

jest.mock('../../db/db')
const { db } = require('../../db/db')

const mockTable = getMockTable('base')

describe('BaseService', () => {
  let service: BaseService<typeof mockTable>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new BaseService(mockTable, mockTable.name, mockRedisService)
  })

  describe('create', () => {
    let newRow: { id: number; name: string }

    beforeAll(() => {
      newRow = { id: 1, name: 'New' }
    })

    it('should add new item to Redis and return it', async () => {
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnThis(),
        $returningId: jest.fn().mockResolvedValue([{ id: newRow.id }]),
      })
      jest.spyOn(service, 'getById').mockResolvedValue(newRow)

      const result = await service.create({ name: newRow.name })

      expect(result).toEqual(newRow)
      expect(mockRedisService.addToList).toHaveBeenCalledWith(
        mockTable.name,
        newRow,
      )
    })

    it('should return undefined if no row was inserted', async () => {
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnThis(),
        $returningId: jest.fn().mockResolvedValue([]),
      })
      const getBySpy = jest.spyOn(service, 'getById').mockResolvedValue(newRow)

      const result = await service.create({ name: newRow.name })

      expect(result).toEqual(undefined)
      expect(getBySpy).not.toHaveBeenCalled()
      expect(mockRedisService.addToList).not.toHaveBeenCalled()
    })
  })

  describe.only('getById', () => {
    it('should return a row by ID', async () => {
      const mockRow = { id: 1, deleted: 0 }
      db.select.mockReturnValue({
        from: jest
          .fn()
          .mockReturnValue({ where: jest.fn().mockResolvedValue([mockRow]) }),
      })

      const result = await service.getById(1)

      expect(result).toEqual(mockRow)
    })

    it('should return undefined if no row exists with ID', async () => {
      db.select.mockReturnValue({
        from: jest
          .fn()
          .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
      })

      const result = await service.getById(1)

      expect(result).toEqual(undefined)
    })
  })

  describe('existsById', () => {
    it('should return true if row exists', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue({ id: 1 })

      const result = await service.existsById(1)

      expect(result).toBe(true)
    })

    it('should return false if row does not exist', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(undefined)

      const result = await service.existsById(1)

      expect(result).toBe(false)
    })
  })

  describe('getAll', () => {
    let mockData: { id: number; name: string; deleted: number }[]

    beforeAll(() => {
      mockData = [{ id: 1, name: 'Cached', deleted: 0 }]
    })

    it('should return cached data if present without fetching from database', async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify(mockData))

      const result = await service.getAll()

      expect(result).toEqual(mockData)
      expect(db.select).not.toHaveBeenCalled()
    })

    it('should fetch from database and cache', async () => {
      mockRedisService.get.mockResolvedValue(null)
      const mockedWhere = jest.fn().mockReturnThis()
      const mockedOrderBy = jest.fn().mockResolvedValue(mockData)
      db.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockedWhere,
          orderBy: mockedOrderBy,
        }),
      })

      const result = await service.getAll()

      expect(result).toEqual(mockData)
      expect(mockRedisService.set).toHaveBeenCalledWith(
        mockTable.name,
        JSON.stringify(mockData),
      )
    })
  })

  describe('update', () => {
    let rowToUpdate: any
    let payload: any
    let updatedRow: any

    beforeAll(() => {
      rowToUpdate = { id: 1, name: 'row' }
      payload = { name: 'updatedRow' }
      updatedRow = { ...rowToUpdate, name: payload.name }
    })

    it('should update Redis if row exists', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(updatedRow)
      db.update.mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      })

      const result = await service.update(rowToUpdate.id, payload)

      expect(result).toEqual(updatedRow)
      expect(mockRedisService.updateListItem).toHaveBeenCalledWith(
        mockTable.name,
        'id',
        rowToUpdate.id,
        updatedRow,
      )
    })

    it('should not update Redis if no rows were updated', async () => {
      jest.spyOn(service, 'getById').mockResolvedValue(undefined)
      db.update.mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(undefined),
      })

      const result = await service.update(rowToUpdate.id, payload)

      expect(result).toEqual(undefined)
      expect(mockRedisService.updateListItem).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should do nothing if deletion fails', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]), // ! Empty arrays means no rows were updated
      })

      await service.delete(1)

      expect(mockRedisService.removeListItem).not.toHaveBeenCalled()
    })

    it('should remove item from Redis if deletion succeeds', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{}]),
      })

      await service.delete(1)

      expect(mockRedisService.removeListItem).toHaveBeenCalledWith(
        mockTable.name,
        'id',
        1,
      )
    })
  })
})
