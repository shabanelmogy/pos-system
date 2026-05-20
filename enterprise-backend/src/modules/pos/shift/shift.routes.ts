import express from "express";
import shiftController from "./shift.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.post("/open", authorize("pos:manage_shifts"), shiftController.open);
router.post("/close/:id", authorize("pos:manage_shifts"), shiftController.close);
router.get("/active", shiftController.getActive);
router.get("/:id/reconciliation", authorize("pos:manage_shifts"), shiftController.getReconciliation);
router.get("/", authorize("reporting:view"), shiftController.getAll);

export default router;
