import { db } from "../../../config/database.js";
import { permissions, roles, rolePermissions, userRoles } from "./rbac.schema.js";
import { users } from "../user/user.schema.js";
import { PERMISSIONS, DEFAULT_ROLES } from "./permissions.seed.js";
import { eq, and, or } from "drizzle-orm";

export async function seedRBAC() {
  console.log("🌱 Seeding permissions...");
  for (const perm of PERMISSIONS) {
    const [existing] = await db.select().from(permissions).where(eq(permissions.key, perm.key)).limit(1);
    if (!existing) {
      await db.insert(permissions).values(perm);
    }
  }

  console.log("🌱 Seeding default roles...");
  for (const [key, data] of Object.entries(DEFAULT_ROLES)) {
    let [role] = await db.select().from(roles).where(eq(roles.name, data.name)).limit(1);
    if (!role) {
      [role] = await db.insert(roles).values({ name: data.name, description: data.description }).returning();
    }

    for (const permKey of data.permissions) {
      const [permission] = await db.select().from(permissions).where(eq(permissions.key, permKey)).limit(1);
      if (!permission) continue;

      const [link] = await db.select().from(rolePermissions).where(
        and(eq(rolePermissions.roleId, role.id), eq(rolePermissions.permissionId, permission.id))
      ).limit(1);

      if (!link) {
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: permission.id });
      }
    }
  }

  // Assign "Admin" role to any user with role 'admin' or 'Admin' in users table
  console.log("🌱 Mapping admin users to Admin role...");
  const adminRole = await db.select().from(roles).where(eq(roles.name, "Admin")).limit(1).then(r => r[0]);
  if (adminRole) {
    const admins = await db.select().from(users).where(or(eq(users.role, "admin"), eq(users.role, "Admin")));
    for (const adminUser of admins) {
      const [existingUserRole] = await db.select().from(userRoles).where(
        and(eq(userRoles.userId, adminUser.id), eq(userRoles.roleId, adminRole.id))
      ).limit(1);

      if (!existingUserRole) {
        await db.insert(userRoles).values({
          userId: adminUser.id,
          roleId: adminRole.id,
        });
        console.log(`👤 Assigned 'Admin' role to user: ${adminUser.email}`);
      }
    }
  }

  console.log("✅ Seed complete.");
}
