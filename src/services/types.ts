/* eslint-disable no-unused-vars */

export interface IRedisService {
  get(key: string): Promise<string | null>
  set(key: string, value: any, options?: { EX: number }): void
  remove(key: string): void
  addToList(key: string, value: any): void
  removeListItem(listKey: string, identifier: any, identifierValue: any): void
  updateListItem(
    listKey: string,
    identifier: string,
    identifierValue: any,
    newValue: any,
  ): void
}
