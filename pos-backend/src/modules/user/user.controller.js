import userService from "./user.service.js";
import shiftRepository from "../shift/shift.repository.js";
import jwt from "jsonwebtoken";
import config from "../../../config/config.js";
import { handleError } from "../../utils/errorHandler.js";
import { createUserSchema, loginSchema } from "./user.validation.js";

const sanitizeUser = (user) => {
    const safeUser = { ...user };
    delete safeUser.password;
    return safeUser;
}

const findUserActiveShift = async (user) => {
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
    async register(req, res) {
        try {
            const validatedData = createUserSchema.parse(req.body);
            const newUser = await userService.registerUser(validatedData);
            res.status(201).json({
                success: true, 
                message: "New user created!", 
                data: sanitizeUser(newUser)
            });
        } catch (error) {
            handleError(res, error, "userController.register");
        }
    },

    async login(req, res) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const user = await userService.loginUser(email, password);

            const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret, {
                expiresIn: '15m' // Short lived
            });

            const refreshToken = jwt.sign({ _id: user.id }, config.refreshTokenSecret, {
                expiresIn: '7d' // Long lived
            });

            await userService.updateRefreshToken(user.id, refreshToken);

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: 'lax',
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
            handleError(res, error, "userController.login");
        }
    },

    async getUserData(req, res) {
        try {
            const user = await userService.getUserById(req.user._id);
            const activeShift = await findUserActiveShift(user);
            
            res.status(200).json({
                success: true, 
                data: sanitizeUser(user),
                activeShift: activeShift
            });
        } catch (error) {
            handleError(res, error, "userController.getUserData");
        }
    },

    async logout(req, res) {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: config.nodeEnv === 'production',
                path: '/'
            });

            if (req.user && req.user._id) {
                await userService.updateRefreshToken(req.user._id, null);
            }

            res.status(200).json({
                success: true, 
                message: "User logout successfully!"
            });
        } catch (error) {
            handleError(res, error, "userController.logout");
        }
    },

    async getUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({
                success: true,
                data: users.map(sanitizeUser)
            });
        } catch (error) {
            handleError(res, error, "userController.getUsers");
        }
    },

    async createUser(req, res) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: "User created successfully!",
                data: sanitizeUser(user)
            });
        } catch (error) {
            handleError(res, error, "userController.createUser");
        }
    },

    async updateUser(req, res) {
        try {
            const user = await userService.updateUser(req.params.userId, req.body);
            res.status(200).json({
                success: true,
                message: "User updated successfully!",
                data: sanitizeUser(user)
            });
        } catch (error) {
            handleError(res, error, "userController.updateUser");
        }
    },

    async assignPOS(req, res) {
        try {
            const { userId, posPointIds } = req.body;
            const result = await userService.assignPOS(userId, posPointIds);
            const user = await userService.getUserById(userId);
            const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret, {
                expiresIn: '1d'
            });
            res.status(200).json({
                success: true, 
                message: `Welcome back, ${user.name}`,
                data: user,
                token: accessToken
            });
        } catch (error) {
            handleError(res, error, "userController.assignPOS");
        }
    },

    async deleteUser(req, res) {
        try {
            await userService.deleteUser(req.params.userId);
            res.status(200).json({
                success: true,
                message: "User deleted successfully!"
            });
        } catch (error) {
            handleError(res, error, "userController.deleteUser");
        }
    },

    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ success: false, message: "Refresh token not found" });
            }

            const user = await userService.findByRefreshToken(refreshToken);
            if (!user) {
                return res.status(403).json({ success: false, message: "Invalid refresh token" });
            }

            jwt.verify(refreshToken, config.refreshTokenSecret, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
                }

                const accessToken = jwt.sign({ _id: user.id }, config.accessTokenSecret, {
                    expiresIn: '15m'
                });

                res.status(200).json({
                    success: true,
                    token: accessToken
                });
            });
        } catch (error) {
            handleError(res, error, "userController.refreshToken");
        }
    }
};

export default userController;
