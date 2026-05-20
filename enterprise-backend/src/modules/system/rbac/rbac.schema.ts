import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "../user/user.schema.js";

// 1. Categories for grouping permissions
export const permissionCategoryEnum = pgEnum("permission_category", [
  "users",
  "roles",
  "pos",
  "catalog",
  "orders",
  "crm",
  "reporting",
  "system",
]);

// 2. Roles Table
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(), // Unique system-wide name
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Permissions Table (System-defined, Immutable)
export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "users:create"
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 500 }),
    category: permissionCategoryEnum("category").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: index("permissions_key_idx").on(t.key),
    categoryIdx: index("permissions_category_idx").on(t.category),
  })
);

// 4. Role <-> Permission Association (Many-to-Many Join Table)
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
    roleIdx: index("role_permissions_role_idx").on(t.roleId),
    permissionIdx: index("role_permissions_permission_idx").on(t.permissionId),
  })
);

// 5. User <-> Role Association (Many-to-Many Join Table)
export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // References users table
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    assignedBy: uuid("assigned_by")
      .references(() => users.id, { onDelete: "set null" }),
  },
  (t) => ({
    userRoleUnique: index("user_role_unique_idx").on(t.userId, t.roleId),
    userIdx: index("user_roles_user_idx").on(t.userId),
    roleIdx: index("user_roles_role_idx").on(t.roleId),
  })
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
