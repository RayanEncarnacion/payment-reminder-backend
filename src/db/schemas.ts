import {
  bigint,
  char,
  date,
  datetime,
  decimal,
  int,
  mysqlTable,
  serial,
  tinyint,
  varchar,
} from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users', {
  id: serial().primaryKey(),
  email: varchar({ length: 100 }).notNull().unique(),
  username: varchar({ length: 100 }).notNull(),
  deleted: tinyint().default(0).notNull(),
  passwordHash: varchar({ length: 100 }).notNull(),
  createdAt: datetime().default(new Date()),
})

export const clientsTable = mysqlTable('clients', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  email: varchar({ length: 100 }).notNull().unique(),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int()
    .references(() => usersTable.id)
    .notNull(),
})

export const projectsTable = mysqlTable('projects', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  clientId: int()
    .references(() => clientsTable.id)
    .notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int()
    .references(() => usersTable.id)
    .notNull(),
})

export const projectDatesTable = mysqlTable('projectDates', {
  id: serial().primaryKey(),
  projectId: int()
    .references(() => projectsTable.id)
    .notNull(),
  day: tinyint().notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int()
    .references(() => usersTable.id)
    .notNull(),
})

export const paymentsTable = mysqlTable('payments', {
  id: serial().primaryKey(),
  projectId: int()
    .references(() => projectsTable.id)
    .notNull(),
  dueDate: date().notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  payed: tinyint().default(0).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
})

export const refreshTokens = mysqlTable('refreshTokens', {
  id: serial().primaryKey(),
  tokenId: char({ length: 32 }).primaryKey(),
  userId: bigint({ mode: 'number', unsigned: true })
    .references(() => usersTable.id)
    .notNull(),
  used: tinyint().default(0).notNull(),
  expiresAt: datetime().notNull(),
})

export type DBTables =
  | typeof usersTable
  | typeof clientsTable
  | typeof projectsTable
