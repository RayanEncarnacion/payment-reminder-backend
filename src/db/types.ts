import { usersTable, clientsTable, projectsTable } from './schemas'

export type DBTables =
  | typeof usersTable
  | typeof clientsTable
  | typeof projectsTable
