import express from "express";
import posSettingsController from "./posSettings.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.get("/", isVerifiedUser, posSettingsController.getAll);
router.get("/:posPointId", isVerifiedUser, posSettingsController.get);
router.patch("/:posPointId", isVerifiedUser, posSettingsController.update);

export default router;
