import express from "express";
import shiftController from "./shift.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.post("/open", shiftController.open);
router.post("/close/:id", shiftController.close);
router.get("/active", shiftController.getActive);
router.get("/:id/reconciliation", shiftController.getReconciliation);
router.get("/", shiftController.getAll);

export default router;
