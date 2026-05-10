import { eq } from "drizzle-orm";
import { users, userPosPermissions } from "./user.schema.js";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { db } from "../../config/database.js";

const userRepository = {
  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!result[0]) return null;

    const user = result[0];
    // Fetch relations manually for stability
    const branchRes = await db.select().from(branches).where(eq(branches.id, user.branchId)).limit(1);
    const posPermissionsRes = await db
      .select({
        id: userPosPermissions.id,
        userId: userPosPermissions.userId,
        posPointId: userPosPermissions.posPointId,
        posPoint: posPoints
      })
      .from(userPosPermissions)
      .leftJoin(posPoints, eq(userPosPermissions.posPointId, posPoints.id))
      .where(eq(userPosPermissions.userId, user.id));

    return { 
      ...user, 
      branch: branchRes[0] || null, 
      posPermissions: posPermissionsRes 
    };
  },

  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!result[0]) return null;

    const user = result[0];
    const branchRes = await db.select().from(branches).where(eq(branches.id, user.branchId)).limit(1);
    const posPermissionsRes = await db
      .select({
        id: userPosPermissions.id,
        userId: userPosPermissions.userId,
        posPointId: userPosPermissions.posPointId,
        posPoint: posPoints
      })
      .from(userPosPermissions)
      .leftJoin(posPoints, eq(userPosPermissions.posPointId, posPoints.id))
      .where(eq(userPosPermissions.userId, user.id));

    return { 
      ...user, 
      branch: branchRes[0] || null, 
      posPermissions: posPermissionsRes 
    };
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
