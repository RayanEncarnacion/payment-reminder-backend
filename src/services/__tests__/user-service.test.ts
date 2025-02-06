import { eq } from 'drizzle-orm'
import { getMockTable, mockRedisService } from '../mocks/RedisService'
import { UserService } from '../user'

jest.mock('../../db/db')
jest.mock('../../utils/encryption')

const { db } = require('../../db/db')
const { comparePassword } = require('../../utils/encryption')

const mockUsersTable = getMockTable('users')

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UserService(
      mockUsersTable,
      mockUsersTable.name,
      mockRedisService,
    )
  })

  describe('getByEmail', () => {
    it('should return a row by email', async () => {
      const row = { id: 1, name: 'New', email: 'test@nomail.com' }
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([row]),
      }
      db.select.mockReturnValue(mockQuery)

      const result = await service.getByEmail(row.email)

      expect(result).toEqual(row)
      expect(mockQuery.from).toHaveBeenCalledWith(service.table)
      expect(mockQuery.where).toHaveBeenCalledWith(
        eq(service.table.email, row.email),
      )
    })
  })

  describe('getByCredentials', () => {
    let row: { id: number; name: string; email: string; password: string }

    beforeAll(() => {
      row = {
        id: 1,
        name: 'New',
        email: 'test@nomail.com',
        password: '123456',
      }
    })

    it('should return a row by credentials', async () => {
      jest.spyOn(service, 'getByEmail').mockResolvedValue(row as any)
      comparePassword.mockResolvedValue(true)

      const result = await service.getByCredentials(row.email, row.password)

      expect(result).toEqual(row)
    })

    it('should return null if no user was found with email', async () => {
      jest.spyOn(service, 'getByEmail').mockResolvedValue(undefined as any)

      const result = await service.getByCredentials(row.email, row.password)

      expect(result).toEqual(null)
      expect(comparePassword).not.toHaveBeenCalled()
    })

    it('should return null if the passwords do not match', async () => {
      jest.spyOn(service, 'getByEmail').mockResolvedValue(row as any)
      comparePassword.mockResolvedValue(false)

      const result = await service.getByCredentials(row.email, row.password)

      expect(result).toEqual(null)
    })
  })
})
