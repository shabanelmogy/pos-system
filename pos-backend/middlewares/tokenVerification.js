import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userRepository from "../src/modules/user/user.repository.js";
import { fail } from "../src/utils/errorHandler.js";

export const isVerifiedUser = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        
        if (!accessToken) {
            fail("Please provide token!", 401);
        }

        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);

        const user = await userRepository.findById(decodeToken._id);
        if (!user) {
            fail("User does not exist!", 401);
        }

        req.user = { ...user, _id: user.id }; 
        next();
    } catch (error) {
        next(error);
    }
}