import {
  usersTable,
  clientsTable,
  projectsTable,
  paymentsTable,
} from './schemas'

export type DBTables =
  | typeof usersTable
  | typeof clientsTable
  | typeof projectsTable
  | typeof paymentsTable
