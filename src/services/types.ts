export interface IRedisService {
  get(key: string): Promise<string | null>
  set(key: string, value: any, options?: { EX: number }): void
  addToList(key: string, value: any): void
  removeFromList(listKey: string, identifier: any, identifierValue: any): void
}
