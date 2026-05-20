import { eq, and, inArray, count, sql } from "drizzle-orm";
import { db } from "../../../config/database.js";
import { roles, permissions, userRoles, rolePermissions } from "./rbac.schema.js";
import { users } from "../user/user.schema.js";

export const rbacRepository = {
  /**
   * Fetches roles and merged permissions associated with a user.
   */
  async getUserWithRolesAndPermissions(userId: string) {
    const roleRecords = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const roleList = roleRecords.map((r) => r.role);
    if (roleList.length === 0) {
      return { roles: [], permissions: [] };
    }

    const roleIds = roleList.map((r) => r.id);
    const permissionRecords = await db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    // Deduplicate permissions by key
    const uniquePermissions = Array.from(
      new Map(permissionRecords.map((p) => [p.permission.key, p.permission])).values()
    );

    return { roles: roleList, permissions: uniquePermissions };
  },

  /**
   * Creates a role and attaches its list of permissions atomically
   */
  async createRole(name: string, description: string | undefined, permissionIds: string[]) {
    return db.transaction(async (tx) => {
      const [role] = await tx.insert(roles).values({ name, description }).returning();

      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map((pId) => ({ roleId: role.id, permissionId: pId }))
        );
      }
      return role;
    });
  },

  /**
   * Updates a role, its permissions, and increments user stale claims version
   */
  async updateRole(roleId: string, name: string, description: string | undefined, permissionIds: string[]) {
    return db.transaction(async (tx) => {
      const [role] = await tx
        .update(roles)
        .set({ name, description, updatedAt: new Date() })
        .where(eq(roles.id, roleId))
        .returning();

      // Clear existing permissions
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      // Insert new permissions
      if (permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          permissionIds.map((pId) => ({ roleId, permissionId: pId }))
        );
      }

      // Increment permissions version for all users assigned to this role
      const assignedUsers = await tx
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(eq(userRoles.roleId, roleId));

      if (assignedUsers.length > 0) {
        const userIds = assignedUsers.map((u) => u.userId);
        await tx
          .update(users)
          .set({ permissionsVersion: sql`${users.permissionsVersion} + 1`, updatedAt: new Date() })
          .where(inArray(users.id, userIds));
      }

      return role;
    });
  },

  /**
   * Counts users currently assigned to this role
   */
  async countAssignments(roleId: string): Promise<number> {
    const [{ value }] = await db
      .select({ value: count() })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));
    return Number(value);
  },

  /**
   * Assigns roles to a user and increments their permissionsVersion
   */
  async assignRolesToUser(userId: string, roleIds: string[], assignedByUserId?: string) {
    return db.transaction(async (tx) => {
      // Clear existing
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));

      // Assign new roles
      if (roleIds.length > 0) {
        await tx.insert(userRoles).values(
          roleIds.map((rId) => ({
            userId,
            roleId: rId,
            assignedBy: assignedByUserId || null,
          }))
        );
      }

      // Increment permissions version to force client to refresh token
      await tx
        .update(users)
        .set({ permissionsVersion: sql`${users.permissionsVersion} + 1`, updatedAt: new Date() })
        .where(eq(users.id, userId));
    });
  },

  /**
   * Lists all roles with their mapped permissions
   */
  async listRoles() {
    const roleList = await db.select().from(roles);
    const result = [];
    for (const r of roleList) {
      const permissionRecords = await db
        .select({ permission: permissions })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, r.id));
      result.push({
        ...r,
        permissions: permissionRecords.map((p) => p.permission),
      });
    }
    return result;
  },

  /**
   * Lists all permissions in the system
   */
  async listPermissions() {
    return db.select().from(permissions);
  },

  /**
   * Get a single role with its permissions
   */
  async getRoleById(roleId: string) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) return null;

    const permissionRecords = await db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return {
      ...role,
      permissions: permissionRecords.map((p) => p.permission),
    };
  }
};
