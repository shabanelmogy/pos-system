import userRepository from "./user.repository.js";
import bcrypt from "bcryptjs";
import { fail } from "../../utils/errorHandler.js";
import { db } from "../../config/database.js";
import { users, userPosPermissions } from "./user.schema.js";
import { orders } from "../order/order.schema.js";
import { shifts } from "../shift/shift.schema.js";
import { eq } from "drizzle-orm";

const userService = {
  async registerUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      fail("User with this email already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return await userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  },

  async loginUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      fail("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      fail("Invalid email or password", 401);
    }

    return user;
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      fail("User not found", 404);
    }
    return user;
  },

  async getAllUsers() {
    return await db.query.users.findMany({
      with: {
        branch: true,
        posPermissions: {
          with: {
            posPoint: true
          }
        }
      }
    });
  },

  async createUser(userData) {
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
    
    return user;
  },

  async updateUser(userId, userData) {
    const { password, name, email, phone, role, branchId } = userData;
    const updateData = { 
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
      
    return user;
  },

  async assignPOS(userId, posPointIds) {
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

  async deleteUser(userId) {
    // Check if user has orders
    const userOrders = await db.select().from(orders).where(eq(orders.cashierId, userId)).limit(1);
    if (userOrders.length > 0) {
      fail("Cannot delete user because they have associated orders. Try deactivating them instead.", 400);
    }

    // Check if user has shifts
    const userShifts = await db.select().from(shifts).where(eq(shifts.cashierId, userId)).limit(1);
    if (userShifts.length > 0) {
      fail("Cannot delete user because they have operational shift history.", 400);
    }

    return await userRepository.delete(userId);
  },

  async updateRefreshToken(userId, refreshToken) {
    return await db.update(users)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  async findByRefreshToken(refreshToken) {
    const [user] = await db.select().from(users).where(eq(users.refreshToken, refreshToken)).limit(1);
    return user;
  }
};

export default userService;
