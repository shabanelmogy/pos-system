import express from "express";
import userController from "./user.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", isVerifiedUser, userController.getUserData);
router.post("/logout", isVerifiedUser, userController.logout);
router.post("/refresh-token", userController.refreshToken);

// User Management
router.get("/", isVerifiedUser, userController.getUsers);
router.post("/", isVerifiedUser, userController.createUser);
router.put("/:userId", isVerifiedUser, userController.updateUser);
router.delete("/:userId", isVerifiedUser, userController.deleteUser);
router.post("/assign-pos", isVerifiedUser, userController.assignPOS);

export default router;
