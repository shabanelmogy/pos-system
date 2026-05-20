import express from "express";
import userController from "./user.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", isVerifiedUser, userController.getUserData);
router.post("/logout", isVerifiedUser, userController.logout);
router.post("/refresh-token", userController.refreshToken);

// User Management
router.get("/", isVerifiedUser, authorize("users:view"), userController.getUsers);
router.post("/", isVerifiedUser, authorize("users:create"), userController.createUser);
router.put("/:userId", isVerifiedUser, authorize("users:update"), userController.updateUser);
router.delete("/:userId", isVerifiedUser, authorize("users:delete"), userController.deleteUser);
router.post("/assign-pos", isVerifiedUser, authorize("users:update"), userController.assignPOS);

export default router;
