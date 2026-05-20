import { db } from "../src/config/database.js";
import { roles, permissions, userRoles, rolePermissions } from "../src/modules/system/rbac/rbac.schema.js";
import { users } from "../src/modules/system/user/user.schema.js";
import { eq } from "drizzle-orm";
import { rbacRepository } from "../src/modules/system/rbac/rbac.repository.js";

async function test() {
  console.log("🔍 Checking permissions in the database...");
  const perms = await db.select().from(permissions);
  console.log(`Found ${perms.length} permissions.`);

  console.log("\n🔍 Checking roles in the database...");
  const roleList = await db.select().from(roles);
  for (const r of roleList) {
    console.log(`Role: "${r.name}" (${r.description})`);
  }

  console.log("\n🔍 Checking Admin role mapping...");
  const adminRole = roleList.find(r => r.name === "Admin");
  if (!adminRole) {
    console.error("❌ Admin role not found!");
    process.exit(1);
  }

  const rolePerms = await db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, adminRole.id));
  console.log(`Admin role has ${rolePerms.length} mapped permissions.`);

  console.log("\n🔍 Checking mapped admin users...");
  const mappedUsers = await db
    .select({ email: users.email })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .where(eq(userRoles.roleId, adminRole.id));
  
  if (mappedUsers.length === 0) {
    console.error("❌ No users assigned to Admin role!");
    process.exit(1);
  }

  for (const mu of mappedUsers) {
    console.log(`User: ${mu.email} is an Admin`);
  }

  console.log("\n🔍 Testing getUserWithRolesAndPermissions on first Admin...");
  const firstAdminUser = await db.select().from(users).where(eq(users.email, "admin@example.com")).limit(1).then(r => r[0]);
  if (firstAdminUser) {
    const claims = await rbacRepository.getUserWithRolesAndPermissions(firstAdminUser.id);
    console.log(`Roles: ${claims.roles.map(r => r.name).join(", ")}`);
    console.log(`Permissions count: ${claims.permissions.length}`);
    if (claims.permissions.length > 0) {
      console.log("✅ RBAC Repository tests successful!");
    } else {
      console.error("❌ Mapped permissions is 0!");
      process.exit(1);
    }
  } else {
    console.error("❌ admin@example.com user not found!");
    process.exit(1);
  }

  process.exit(0);
}

test().catch(e => {
  console.error("❌ Test failed with error:", e);
  process.exit(1);
});
