import {
  datetime,
  int,
  mysqlTable,
  serial,
  varchar,
} from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  username: varchar({ length: 100 }).notNull(),
  passwordHash: varchar({ length: 100 }).notNull(),
  createdAt: datetime().default(new Date()).notNull(),
  createdBy: int().notNull(),
});

export const clientsTable = mysqlTable("clients", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: datetime().default(new Date()).notNull(),
  createdBy: int().notNull(),
});
