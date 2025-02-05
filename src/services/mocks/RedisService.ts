import { IRedisService } from '@src/services/types'

export const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  updateListItem: jest.fn(),
  removeListItem: jest.fn(),
  addToList: jest.fn(),
} as jest.Mocked<IRedisService>

export const getMockTable = (name: string = 'mock') =>
  ({
    id: 'id',
    deleted: 'deleted',
    email: 'email',
    name,
  }) as any
