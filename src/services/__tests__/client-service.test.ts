import { ClientService } from '../client'
import { getMockTable, mockRedisService } from '../mocks/RedisService'

jest.mock('../../db/db')
const { db } = require('../../db/db')

const mockClientsTable = getMockTable('clients')
const mockProjectsTable = getMockTable('projects')

describe('ClientService', () => {
  let service: ClientService

  beforeEach(() => {
    jest.clearAllMocks()
    const mockProjectsTable = getMockTable('projects')
    service = new ClientService(
      mockClientsTable,
      mockClientsTable.name,
      mockProjectsTable,
      mockRedisService,
    )
  })

  describe('getByEmail', () => {
    let row: { id: number; name: string; email: string }

    beforeAll(() => {
      row = { id: 1, name: 'New', email: 'test@nomail.com' }
    })

    it('should return a row by email', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([row]),
      })

      const result = await service.getByEmail(row.email)

      expect(result).toEqual(row)
    })

    it('should return undefined if no row has email', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      })

      const result = await service.getByEmail(row.email)

      expect(result).toEqual(undefined)
    })
  })

  describe('delete', () => {
    it('should delete client from db and redis and projects from db', async () => {
      const rowId = 1
      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{}]),
      }
      db.transaction.mockImplementation((callback: any) => callback(mockTx))

      const result = await service.delete(rowId)

      // ! Should update clients and projects tables, and update redis
      expect(result).toEqual(true)
      expect(mockTx.update).toHaveBeenCalledTimes(2)
      expect(mockTx.update).toHaveBeenCalledWith(mockClientsTable)
      expect(mockTx.update).toHaveBeenNthCalledWith(2, mockProjectsTable)
      expect(mockRedisService.removeListItem).toHaveBeenCalledWith(
        mockClientsTable.name,
        'id',
        rowId,
      )
    })

    it('should not delete row with ID', async () => {
      const rowId = 1
      const mockTx = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]), // ! Returns empty rows updated
      }
      db.transaction.mockImplementation((callback: any) => callback(mockTx))

      const result = await service.delete(rowId)

      // ! Should not update rows in the clients table and avoid calling the redis service
      expect(result).toEqual(undefined)
      expect(mockTx.update).toHaveBeenCalledTimes(1)
      expect(mockTx.update).toHaveBeenCalledWith(mockClientsTable)
      expect(mockRedisService.removeListItem).not.toHaveBeenCalled()
    })
  })
})
