import {
  datetime,
  int,
  mysqlTable,
  serial,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar({ length: 100 }).notNull().unique(),
  username: varchar({ length: 100 }).notNull(),
  passwordHash: varchar({ length: 100 }).notNull(),
  createdAt: datetime().default(new Date()).notNull(),
  createdBy: int().notNull(),
});

export const clientsTable = mysqlTable("clients", {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),

export const projectsTable = mysqlTable("projects", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar({ length: 100 }).notNull().unique(),
  clientId: int("clientId").references(() => clientsTable.id),
  active: tinyint().default(1).notNull(),
  deleted: tinyint().default(0).notNull(),
  createdAt: datetime().default(new Date()),
  createdBy: int().references(() => usersTable.id),
});
