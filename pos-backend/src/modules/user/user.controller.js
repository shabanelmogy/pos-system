import userService from "./user.service.js";
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
                sameSite: 'none',
                secure: true
            });

            res.status(200).json({
                success: true, 
                message: "User login successfully!", 
                data: sanitizeUser(user)
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
                sameSite: 'none',
                secure: true
            });
            res.status(200).json({
                success: true, 
                message: "User logout successfully!"
            });
        } catch (error) {
            handleError(res, error, "userController.logout");
        }
    }
};

export default userController;
