import express from "express";
import userController from "./user.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", isVerifiedUser, userController.getUserData);
router.post("/logout", isVerifiedUser, userController.logout);

export default router;
