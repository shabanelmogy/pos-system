import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userRepository from "../src/modules/system/user/user.repository.js";
import shiftRepository from "../src/modules/pos/shift/shift.repository.js";
import { fail } from "../src/utils/errorHandler.js";
import { rbacRepository } from "../src/modules/system/rbac/rbac.repository.js";

// Extend the Express Request interface globally to allow typed req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id: string;
        name?: string;
        phone?: number | string;
        email?: string;
        role?: string;
        branchId?: string | null;
        posPermissions?: any[];
        activeShiftId: string | null;
        activePosPointId: string | null;
        roles: string[];
        permissions: string[];
        [key: string]: any;
      };
    }
  }
}

interface ShiftCacheEntry {
  activeShiftId: string | null;
  activePosPointId: string | null;
  expiresAt: number;
}

// Global cache for active shifts (userId -> { activeShiftId, activePosPointId, expiresAt })
const shiftCache = new Map<string, ShiftCacheEntry>();
const CACHE_TTL = 30000; // 30 seconds

export const isVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let accessToken = req.cookies.accessToken;

        // Fallback to Authorization header if cookie is missing
        if (!accessToken && req.headers.authorization) {
            accessToken = req.headers.authorization.split(" ")[1];
        }
        
        if (!accessToken) {
            fail("Please provide token!", 401);
        }

        let decodeToken: any;
        try {
            decodeToken = jwt.verify(accessToken, config.accessTokenSecret as string);
        } catch (err) {
            return fail("Invalid or expired token!", 401);
        }

        const userId = decodeToken._id || decodeToken.userId;
        const user: any = await userRepository.findById(userId);
        if (!user) {
            fail("User does not exist!", 401);
        }

        // Stale Claim Invalidation
        if (decodeToken.permissionsVersion !== undefined && user.permissionsVersion !== undefined) {
            if (decodeToken.permissionsVersion < user.permissionsVersion) {
                return fail("Token is stale. Please re-authenticate.", 401);
            }
        }

        let roles = decodeToken.roles;
        let permissions = decodeToken.permissions;
        if (!roles || !permissions) {
            const rbacData = await rbacRepository.getUserWithRolesAndPermissions(userId);
            roles = rbacData.roles.map((r: any) => r.name);
            permissions = rbacData.permissions.map((p: any) => p.key);
        }

        // Derive active session context (Check Cache first)
        const now = Date.now();
        const cached = shiftCache.get(userId);
        
        let activeShiftId: string | null = null;
        let activePosPointId: string | null = null;

        // --- Header-first resolution (fastest, most reliable) ---
        // The POS frontend sends these from its persisted Zustand store,
        // so we don't need a round-trip to the DB on every order request.
        const headerShiftId = req.headers["x-shift-id"] as string | undefined;
        const headerPosPointId = req.headers["x-pos-point-id"] as string | undefined;

        if (headerShiftId && headerPosPointId) {
            activeShiftId = headerShiftId;
            activePosPointId = headerPosPointId;
        } else if (cached && cached.expiresAt > now) {
            activeShiftId = cached.activeShiftId;
            activePosPointId = cached.activePosPointId;
        } else {
            const posPerms = user.posPermissions || [];
            for (const perm of posPerms) {
                const pid = perm.posPointId || perm.posPoint?.id;
                if (pid) {
                    const shift: any = await shiftRepository.findActiveShift(pid);
                    if (shift) {
                        activeShiftId = shift.id;
                        activePosPointId = pid;
                        break; // Found the active session
                    }
                }
            }
            // Update Cache
            shiftCache.set(userId, {
                activeShiftId,
                activePosPointId,
                expiresAt: now + CACHE_TTL
            });
        }

        req.user = { 
            ...user, 
            id: userId,
            _id: userId,
            roles,
            permissions,
            activeShiftId,
            activePosPointId
        }; 
        
        next();
    } catch (error) {
        next(error);
    }
};
