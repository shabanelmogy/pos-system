import { db } from "../../../config/database.js";
import { roles, permissions, rolePermissions } from "./rbac.schema.js";
import { eq, inArray } from "drizzle-orm";
import { rbacRepository } from "./rbac.repository.js";

export const roleService = {
  /**
   * Validates if role name is unique (excluding a specific role ID if updating)
   */
  async validateUniqueName(name: string, excludeRoleId?: string) {
    const query = db.select().from(roles).where(eq(roles.name, name)).limit(1);
    const [existing] = await query;
    if (existing && (!excludeRoleId || existing.id !== excludeRoleId)) {
      throw new Error(`Role name '${name}' is already in use`);
    }
  },

  /**
   * Validates if all permission IDs exist in the database
   */
  async validatePermissionIds(permissionIds: string[]) {
    if (permissionIds.length === 0) return;

    const validPerms = await db
      .select({ id: permissions.id })
      .from(permissions)
      .where(inArray(permissions.id, permissionIds));

    if (validPerms.length !== permissionIds.length) {
      throw new Error("One or more permission IDs are invalid");
    }
  },

  /**
   * Create role with safety guards
   */
  async createRole(name: string, description: string | undefined, permissionIds: string[]) {
    // 1. Name Conflict Guard
    await this.validateUniqueName(name);

    // 2. Permission Validator Guard
    await this.validatePermissionIds(permissionIds);

    // 3. Perform insert
    return rbacRepository.createRole(name, description, permissionIds);
  },

  /**
   * Update role with safety guards
   */
  async updateRole(roleId: string, name: string, description: string | undefined, permissionIds: string[]) {
    const role = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1).then((r) => r[0]);
    if (!role) throw new Error("Role not found");

    // 1. Name Conflict Guard
    await this.validateUniqueName(name, roleId);

    // 2. Permission Validator Guard
    await this.validatePermissionIds(permissionIds);

    // 3. Perform update
    return rbacRepository.updateRole(roleId, name, description, permissionIds);
  },

  /**
   * Delete role with safety guards
   */
  async deleteRole(id: string) {
    const role = await db.select().from(roles).where(eq(roles.id, id)).limit(1).then((r) => r[0]);
    if (!role) throw new Error("Role not found");

    // Guard: Prevent deletion of role if in use
    const assignmentsCount = await rbacRepository.countAssignments(id);
    if (assignmentsCount > 0) {
      throw new Error(`Cannot delete role: Assigned to ${assignmentsCount} user(s)`);
    }

    return db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      await tx.delete(roles).where(eq(roles.id, id));
    });
  }
};
