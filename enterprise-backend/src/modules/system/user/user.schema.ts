import { pgTable, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../../pos/posPoint/posPoint.schema.js";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // admin, manager, cashier, kitchen
  branchId: uuid("branch_id").references(() => branches.id), // Nullable for global admins
  refreshToken: text("refresh_token"),
  permissionsVersion: integer("permissions_version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPosPermissions = pgTable("user_pos_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  posPointId: uuid("pos_point_id").references(() => posPoints.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserPosPermission = typeof userPosPermissions.$inferSelect;
export type NewUserPosPermission = typeof userPosPermissions.$inferInsert;
