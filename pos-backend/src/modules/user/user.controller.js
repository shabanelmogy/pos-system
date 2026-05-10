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
                expiresIn: '1d'
            });

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/' 
            });

            // Server-side shift check — search all assigned POS terminals for an active session
            let activeShift = null;
            const permissions = user.posPermissions || [];
            
            console.log(`[DEBUG] Login shift check for user ${user.id}. Total Permissions: ${permissions.length}`);
            
            for (const perm of permissions) {
                const pid = perm.posPointId || perm.posPoint?.id;
                console.log(`[DEBUG] Evaluating Permission for POS: ${pid}`);
                
                if (pid) {
                    const shift = await shiftRepository.findActiveShift(pid);
                    if (shift) {
                        console.log(`[DEBUG] Found active shift ${shift.id} (Status: ${shift.status}) on POS ${pid}`);
                        activeShift = shift;
                        break; 
                    }
                }
            }

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
            res.status(200).json({
                success: true, 
                data: sanitizeUser(user)
            });
        } catch (error) {
            handleError(res, error, "userController.getUserData");
        }
    },

    async logout(req, res) {
        try {
            res.clearCookie('accessToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                path: '/'
            });
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
    }
};

export default userController;
