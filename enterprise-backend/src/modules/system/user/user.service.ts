import userRepository from "./user.repository.js";
import bcrypt from "bcryptjs";
import { fail } from "../../../utils/errorHandler.js";
import { db } from "../../../config/database.js";
import { users, userPosPermissions, User, NewUser } from "./user.schema.js";
import { orders } from "../../pos/order/order.schema.js";
import { shifts } from "../../pos/shift/shift.schema.js";
import { eq, or } from "drizzle-orm";

const userService = {
  async registerUser(userData: NewUser): Promise<User> {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      fail("user.email_exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return await userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  },

  async loginUser(email: string, password: string): Promise<any> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      fail("errors.invalid_credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      fail("errors.invalid_credentials", 401);
    }

    return user!;
  },

  async getUserById(id: string): Promise<any> {
    const user = await userRepository.findById(id);
    if (!user) {
      fail("user.not_found", 404);
    }
    return user!;
  },

  async getAllUsers(): Promise<any[]> {
    return await db.query.users.findMany({
      with: {
        branch: true,
        posPermissions: {
          with: {
            posPoint: true
          }
        }
      }
    }) as any[];
  },

  async createUser(userData: any): Promise<User> {
    const { password, name, email, phone, role, branchId } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [user] = await db.insert(users).values({
      name,
      email,
      phone,
      role,
      branchId: branchId || null,
      password: hashedPassword
    }).returning();
    
    return user!;
  },

  async updateUser(userId: string, userData: any): Promise<User> {
    const { password, name, email, phone, role, branchId } = userData;
    const updateData: any = { 
      name, 
      email, 
      phone, 
      role, 
      branchId: branchId || null,
      updatedAt: new Date()
    };
    
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
      
    return user!;
  },

  async assignPOS(userId: string, posPointIds: string[]): Promise<{ success: boolean }> {
    // Clear existing
    await db.delete(userPosPermissions).where(eq(userPosPermissions.userId, userId));
    
    if (posPointIds && posPointIds.length > 0) {
      const values = posPointIds.map(id => ({
        userId,
        posPointId: id
      }));
      await db.insert(userPosPermissions).values(values);
    }
    
    return { success: true };
  },

  async deleteUser(userId: string): Promise<any> {
    // Check if user has orders (as openedBy, waiter, closedBy, voidedBy)
    const userOrders = await db.select().from(orders).where(
      or(
        eq(orders.openedById, userId),
        eq(orders.waiterId, userId),
        eq(orders.closedById, userId),
        eq(orders.voidedById, userId)
      )
    ).limit(1);
    if (userOrders.length > 0) {
      fail("user.has_orders", 400);
    }

    // Check if user has shifts
    const userShifts = await db.select().from(shifts).where(eq(shifts.cashierId, userId)).limit(1);
    if (userShifts.length > 0) {
      fail("user.has_shifts", 400);
    }

    return await userRepository.delete(userId);
  },

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<any> {
    return await db.update(users)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  async findByRefreshToken(refreshToken: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.refreshToken, refreshToken)).limit(1);
    return user || null;
  }
};

export default userService;
