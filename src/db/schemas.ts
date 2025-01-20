import {
  datetime,
  int,
  mysqlTable,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar({ length: 100 }).notNull().unique(),
  username: varchar({ length: 100 }).notNull(),
  deleted: tinyint().default(0).notNull(),
  passwordHash: varchar({ length: 100 }).notNull(),
  createdAt: datetime().default(new Date()),
});

export const clientsTable = mysqlTable("clients", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar({ length: 100 }).notNull().unique(),
  email: varchar({ length: 100 }).notNull().unique(),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int().references(() => usersTable.id),
});

export const projectsTable = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar({ length: 100 }).notNull().unique(),
  clientId: int("clientId").references(() => clientsTable.id),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int().references(() => usersTable.id),
});

export type DBTables =
  | typeof usersTable
  | typeof clientsTable
  | typeof projectsTable;
