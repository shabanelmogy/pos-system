import { eq } from "drizzle-orm";
import { users, userPosPermissions } from "./user.schema.js";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { db } from "../../config/database.js";

const userRepository = {
  async findByEmail(email) {
    // 1. Fetch User
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!result[0]) return null;
    const user = result[0];

    // 2. Fetch Branch
    let branch = null;
    if (user.branchId) {
      const branchRes = await db.select().from(branches).where(eq(branches.id, user.branchId)).limit(1);
      branch = branchRes[0] || null;
    }

    // 3. Fetch Permissions
    const perms = await db.select().from(userPosPermissions).where(eq(userPosPermissions.userId, user.id));
    const posPermissions = [];
    for (const p of perms) {
      const ptRes = await db.select().from(posPoints).where(eq(posPoints.id, p.posPointId)).limit(1);
      posPermissions.push({ ...p, posPoint: ptRes[0] || null });
    }

    return { ...user, branch, posPermissions };
  },

  async findById(id) {
    // 1. Fetch User
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!result[0]) return null;
    const user = result[0];

    // 2. Fetch Branch
    let branch = null;
    if (user.branchId) {
      const branchRes = await db.select().from(branches).where(eq(branches.id, user.branchId)).limit(1);
      branch = branchRes[0] || null;
    }

    // 3. Fetch Permissions
    const perms = await db.select().from(userPosPermissions).where(eq(userPosPermissions.userId, user.id));
    const posPermissions = [];
    for (const p of perms) {
      const ptRes = await db.select().from(posPoints).where(eq(posPoints.id, p.posPointId)).limit(1);
      posPermissions.push({ ...p, posPoint: ptRes[0] || null });
    }

    return { ...user, branch, posPermissions };
  },

  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  async update(id, userData) {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },

  async delete(id) {
    // Delete permissions first due to FK
    await db.delete(userPosPermissions).where(eq(userPosPermissions.userId, id));
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  }
};

export default userRepository;
