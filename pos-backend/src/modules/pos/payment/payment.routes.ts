import express from "express";
import paymentController from "./payment.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.post("/create-order", isVerifiedUser, paymentController.createOrder);
router.post("/verify-payment", isVerifiedUser, paymentController.verifyPayment);
router.post("/webhook-verification", paymentController.webhook);

export default router;
