import express, { Router } from "express";
import orderController from "./order.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router: Router = express.Router();

// All order routes require authentication
router.use(isVerifiedUser);

router.get("/", authorize("orders:view"), orderController.getAll);
router.get("/:id", authorize("orders:view"), orderController.getById);
router.post("/", authorize("orders:create"), orderController.create);

// Specialized Status dimension updates
router.patch("/:id/confirm", authorize("orders:update"), orderController.confirmDraft);
router.patch("/:id/fulfillment", authorize("orders:update"), orderController.updateFulfillment);
router.patch("/:id/lifecycle", authorize("orders:update"), orderController.updateLifecycle);
router.post("/:id/print", authorize("orders:view"), orderController.print);
router.post("/:id/apply-coupon", authorize("orders:update"), orderController.applyCoupon);
router.post("/:id/add-payment", authorize("payments:create"), orderController.addPayment);
router.post("/:id/refund", authorize("orders:void"), orderController.refundOrder);

// Table Management
router.post("/:id/move-table", authorize("orders:update"), orderController.moveTable);
router.post("/:id/merge", authorize("orders:update"), orderController.mergeOrders);
router.post("/:id/split", authorize("orders:update"), orderController.splitOrder);

// Dynamic Item Management
router.post("/:id/items", authorize("orders:update"), orderController.addItem);
router.patch("/:id/items/:itemId", authorize("orders:update"), orderController.updateItemQuantity);
router.delete("/:id/items/:itemId", authorize("orders:update"), orderController.removeItem);
router.patch("/:id/items/:itemId/void", authorize("orders:void"), orderController.voidItem);

export default router;
