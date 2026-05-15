import express from "express";
import orderController from "./order.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

// All order routes require authentication
router.use(isVerifiedUser);

router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);
router.post("/", orderController.create);

// Specialized Status dimension updates
router.patch("/:id/confirm", orderController.confirmDraft);
router.patch("/:id/fulfillment", orderController.updateFulfillment);
router.patch("/:id/lifecycle", orderController.updateLifecycle);
router.post("/:id/print", orderController.print);
router.post("/:id/apply-coupon", orderController.applyCoupon);
router.post("/:id/add-payment", orderController.addPayment);
router.post("/:id/refund", orderController.refundOrder);

// Table Management
router.post("/:id/move-table", orderController.moveTable);
router.post("/:id/merge", orderController.mergeOrders);
router.post("/:id/split", orderController.splitOrder);

// Dynamic Item Management
router.post("/:id/items", orderController.addItem);
router.patch("/:id/items/:itemId", orderController.updateItemQuantity);
router.delete("/:id/items/:itemId", orderController.removeItem);
router.patch("/:id/items/:itemId/void", orderController.voidItem);

export default router;
