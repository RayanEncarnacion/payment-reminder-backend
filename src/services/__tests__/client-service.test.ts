import { ClientService } from '../client'
import { getMockTable, mockRedisService } from '../mocks/RedisService'

jest.mock('../../db/db')
const { db } = require('../../db/db')

const mockClientsTable = getMockTable('clients')

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
})
