import express from "express";
import paymentController from "./payment.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";
import { authorize } from "../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/create-order", isVerifiedUser, authorize("payments:create"), paymentController.createOrder);
router.post("/verify-payment", isVerifiedUser, authorize("payments:create"), paymentController.verifyPayment);
router.post("/webhook-verification", paymentController.webhook);

export default router;
