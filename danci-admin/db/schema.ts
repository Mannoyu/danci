import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin-users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 60 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("admin_users_email_unique").on(table.email),
  check("admin_users_role_check", sql`${table.role} in ('system_admin', 'admin')`),
  check("admin_users_status_check", sql`${table.status} in ('active', 'disabled')`),
]);

export const adminSessions = pgTable("admin-session", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUserId: uuid("admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("admin_session_token_hash_unique").on(table.tokenHash),
  index("admin_session_admin_user_id_idx").on(table.adminUserId),
  index("admin_session_expires_at_idx").on(table.expiresAt),
]);

export type AdminRole = "system_admin" | "admin";
export type AdminStatus = "active" | "disabled";
export type AdminUser = typeof adminUsers.$inferSelect;
