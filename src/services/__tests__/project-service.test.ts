import { and, eq } from 'drizzle-orm'
import { getMockTable } from '../mocks'
import { mockRedisService } from '../mocks/RedisService'
import { ProjectService } from '../project'

jest.mock('../../db/db')
const { db } = require('../../db/db')

const mockProjectsTable = getMockTable('projects')
const mockProjectDatesTable = getMockTable('projectDates')

describe('ProjectService', () => {
  let service: ProjectService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ProjectService(
      mockProjectsTable,
      mockProjectsTable.name,
      mockProjectDatesTable,
      mockRedisService,
    )
  })

  describe('getByName', () => {
    it('should return a row by name', async () => {
      const row = { id: 1, name: 'name' }
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([row]),
      }
      db.select.mockReturnValue(mockQuery)

      const result = await service.getByName(row.name)

      expect(result).toEqual(row)
      expect(mockQuery.from).toHaveBeenCalledWith(service.table)
      expect(mockQuery.where).toHaveBeenCalledWith(
        eq(service.table.name, row.name),
      )
    })
  })

  describe('getWithDates', () => {
    it('should return a list of projects with their dates', async () => {
      const projects = [{ id: 1, name: 'name', dates: [] }]
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(projects),
      }
      db.select.mockReturnValue(mockQuery)

      const result = await service.getWithDates()

      // ! Should query from the projectsTable, join with projectDates table through projectId, filter for non-deleted rows, and group by project.id
      expect(result).toEqual(projects)
      expect(mockQuery.from).toHaveBeenCalledWith(service.table)
      expect(mockQuery.leftJoin).toHaveBeenCalledWith(
        service._projectDates,
        eq(service._projectDates.projectId, service.table.id),
      )
      expect(mockQuery.where).toHaveBeenCalledWith(
        and(eq(service.table.deleted, 0), eq(service._projectDates.deleted, 0)),
      )
      expect(mockQuery.groupBy).toHaveBeenCalledWith(service.table.id)
    })
  })
})
