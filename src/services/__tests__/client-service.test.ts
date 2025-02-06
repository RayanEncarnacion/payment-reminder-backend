import { and, eq } from 'drizzle-orm'
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

  describe.only('getWithProjects', () => {
    it('should return client columns with list of non-deleted projects', async () => {
      const clientId = 1
      const mockedResult = { id: clientId, projects: [] }
      const mockWhere = jest.fn().mockResolvedValue([mockedResult])
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      }
      db.select.mockReturnValue(mockQuery)

      const result = await service.getWithProjects(clientId)

      // ! Should query from the correct table, join with projects through clientId and should filter for non-deleted rows
      expect(result).toEqual(mockedResult)
      expect(mockQuery.from).toHaveBeenCalledWith(service.table)
      expect(mockQuery.innerJoin).toHaveBeenCalledWith(
        service._projectsTable,
        eq(service._projectsTable.clientId, service.table.id),
      )
      expect(mockWhere).toHaveBeenCalledWith(
        and(
          eq(service.table.id, clientId),
          eq(service.table.deleted, 0),
          eq(service._projectsTable.deleted, 0),
        ),
      )
    })
  })
})
