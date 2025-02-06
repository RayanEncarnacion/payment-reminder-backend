export const getMockTable = (name: string = 'mock') =>
  ({
    id: 'id',
    deleted: 'deleted',
    email: 'email',
    name,
  }) as any
