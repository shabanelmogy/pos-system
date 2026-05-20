import express from "express";
import posPointController from "./posPoint.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", posPointController.getAll);
router.get("/:id", posPointController.getById);
router.post("/", authorize("pos:manage_settings"), posPointController.create);
router.put("/:id", authorize("pos:manage_settings"), posPointController.update);
router.delete("/:id", authorize("pos:manage_settings"), posPointController.delete);

export default router;
