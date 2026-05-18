import { Request, Response } from "express";
import userService from "./user.service.js";
import shiftRepository from "../shift/shift.repository.js";
import jwt from "jsonwebtoken";
import config from "../../../config/config.js";
import { handleError } from "../../utils/errorHandler.js";
import { createUserSchema, loginSchema } from "./user.validation.js";

const sanitizeUser = (user: any) => {
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
}

const findUserActiveShift = async (user: any) => {
    const permissions = user.posPermissions || [];
    for (const perm of permissions) {
        const pid = perm.posPointId || perm.posPoint?.id;
        if (pid) {
            const shift = await shiftRepository.findActiveShift(pid);
            if (shift) return shift;
        }
    }
    return null;
}

const userController = {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = createUserSchema.parse(req.body);
            const newUser = await userService.registerUser(validatedData as any);
            res.status(201).json({
                success: true, 
                message: "New user created!", 
                data: sanitizeUser(newUser)
            });
        } catch (error) {
            handleError(res, error as any, "userController.register");
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await userService.loginUser(email, password);

            const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret!, {
                expiresIn: '15m' // Short lived
            });

            const refreshToken = jwt.sign({ _id: user.id }, config.refreshTokenSecret!, {
                expiresIn: '7d' // Long lived
            });

            await userService.updateRefreshToken(user.id, refreshToken);

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
                secure: config.nodeEnv === 'production',
                path: '/' 
            });

            const activeShift = await findUserActiveShift(user);

            res.status(200).json({
                success: true, 
                message: "User login successfully!", 
                data: sanitizeUser(user),
                token: accessToken,
                activeShift: activeShift 
            });
        } catch (error) {
            handleError(res, error as any, "userController.login");
        }
    },

    async getUserData(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.getUserById(req.user!.id);
            const activeShift = await findUserActiveShift(user);
            
            res.status(200).json({
                success: true, 
                data: sanitizeUser(user),
                activeShift: activeShift
            });
        } catch (error) {
            handleError(res, error as any, "userController.getUserData");
        }
    },

    async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: config.nodeEnv === 'production',
                path: '/'
            });

            if (req.user && req.user.id) {
                await userService.updateRefreshToken(req.user.id, null);
            }

            res.status(200).json({
                success: true, 
                message: "User logout successfully!"
            });
        } catch (error) {
            handleError(res, error as any, "userController.logout");
        }
    },

    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const usersList = await userService.getAllUsers();
            res.status(200).json({
                success: true,
                data: usersList.map(sanitizeUser)
            });
        } catch (error) {
            handleError(res, error as any, "userController.getUsers");
        }
    },

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully!",
                data: sanitizeUser(user)
            });
        } catch (error) {
            handleError(res, error as any, "userController.createUser");
        }
    },

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId as string;
            const user = await userService.updateUser(userId, req.body);
            res.status(200).json({
                success: true,
                message: "User updated successfully!",
                data: sanitizeUser(user)
            });
        } catch (error) {
            handleError(res, error as any, "userController.updateUser");
        }
    },

    async assignPOS(req: Request, res: Response): Promise<void> {
        try {
            const { userId, posPointIds } = req.body;
            await userService.assignPOS(userId, posPointIds);
            const user = await userService.getUserById(userId);
            const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret!, {
                expiresIn: '1d'
            });
            res.status(200).json({
                success: true, 
                message: `Welcome back, ${user.name}`,
                data: user,
                token: accessToken
            });
        } catch (error) {
            handleError(res, error as any, "userController.assignPOS");
        }
    },

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId as string;
            await userService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: "User deleted successfully!"
            });
        } catch (error) {
            handleError(res, error as any, "userController.deleteUser");
        }
    },

    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ success: false, message: "Refresh token not found" });
            }

            const user = await userService.findByRefreshToken(refreshToken);
            if (!user) {
                return res.status(403).json({ success: false, message: "Invalid refresh token" });
            }

            jwt.verify(refreshToken, config.refreshTokenSecret!, async (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
                }

                const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret!, {
                    expiresIn: '15m'
                });

                res.status(200).json({
                    success: true,
                    token: accessToken
                });
            });
        } catch (error) {
            handleError(res, error as any, "userController.refreshToken");
        }
    }
};

export default userController;
