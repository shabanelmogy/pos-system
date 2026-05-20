import express from "express";
import posSettingsController from "./posSettings.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.get("/", isVerifiedUser, posSettingsController.getAll);
router.get("/:posPointId", isVerifiedUser, posSettingsController.get);
router.patch("/:posPointId", isVerifiedUser, authorize("pos:manage_settings"), posSettingsController.update);

export default router;
