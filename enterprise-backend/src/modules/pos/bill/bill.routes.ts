import express from "express";
import billController from "./bill.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", authorize("bills:view"), billController.getAll);
router.get("/:id", authorize("bills:view"), billController.getById);
router.get("/order/:orderId", authorize("bills:view"), billController.getByOrderId);
router.post("/", authorize("orders:update"), billController.create);
router.patch("/status/:id", authorize("orders:update"), billController.updateStatus);

export default router;
