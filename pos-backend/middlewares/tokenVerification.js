import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userRepository from "../src/modules/user/user.repository.js";
import shiftRepository from "../src/modules/shift/shift.repository.js";
import { fail } from "../src/utils/errorHandler.js";

// Global cache for active shifts (userId -> { activeShiftId, activePosPointId, expiresAt })
const shiftCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

export const isVerifiedUser = async (req, res, next) => {
    try {
        let accessToken = req.cookies.accessToken;

        // Fallback to Authorization header if cookie is missing
        if (!accessToken && req.headers.authorization) {
            accessToken = req.headers.authorization.split(" ")[1];
        }
        
        if (!accessToken) {
            fail("Please provide token!", 401);
        }

        let decodeToken;
        try {
            decodeToken = jwt.verify(accessToken, config.accessTokenSecret);
        } catch (err) {
            return fail("Invalid or expired token!", 401);
        }

        const userId = decodeToken._id;
        const user = await userRepository.findById(userId);
        if (!user) {
            fail("User does not exist!", 401);
        }

        // Derive active session context (Check Cache first)
        const now = Date.now();
        const cached = shiftCache.get(userId);
        
        let activeShiftId = null;
        let activePosPointId = null;

        if (cached && cached.expiresAt > now) {
            activeShiftId = cached.activeShiftId;
            activePosPointId = cached.activePosPointId;
        } else {
            const permissions = user.posPermissions || [];
            for (const perm of permissions) {
                const pid = perm.posPointId || perm.posPoint?.id;
                if (pid) {
                    const shift = await shiftRepository.findActiveShift(pid);
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
            activeShiftId,
            activePosPointId
        }; 
        
        next();
    } catch (error) {
        next(error);
    }
}