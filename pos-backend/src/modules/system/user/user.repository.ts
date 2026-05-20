import { eq } from "drizzle-orm";
import { users, userPosPermissions, User, NewUser } from "./user.schema.js";
import { branches } from "../../system/branch/branch.schema.js";
import { posPoints } from "../../pos/posPoint/posPoint.schema.js";
import { posSettings } from "../../pos/posSettings/posSettings.schema.js";
import { db } from "../../../config/database.js";

const userRepository = {
  async findByEmail(email: string): Promise<any | null> {
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
      const setRes = await db.select().from(posSettings).where(eq(posSettings.posPointId, p.posPointId)).limit(1);
      
      const pointData = ptRes[0] as any || null;
      if (pointData) {
          pointData.settings = setRes[0] || null;
      }
      
      posPermissions.push({ ...p, posPoint: pointData });
    }

    return { ...user, branch, posPermissions };
  },

  async findById(id: string): Promise<any | null> {
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
      const setRes = await db.select().from(posSettings).where(eq(posSettings.posPointId, p.posPointId)).limit(1);
      
      const pointData = ptRes[0] as any || null;
      if (pointData) {
          pointData.settings = setRes[0] || null;
      }
      
      posPermissions.push({ ...p, posPoint: pointData });
    }

    return { ...user, branch, posPermissions };
  },

  async create(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  async update(id: string, userData: Partial<NewUser>): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },

  async delete(id: string): Promise<User | undefined> {
    // Delete permissions first due to FK
    await db.delete(userPosPermissions).where(eq(userPosPermissions.userId, id));
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0];
  }
};

export default userRepository;
