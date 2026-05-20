import { Router } from "express";
import couponController from "./coupon.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = Router();

// All coupon routes require authentication
router.use(isVerifiedUser);

router.get("/validate", couponController.validate);
router.get("/", authorize("catalog:view"), couponController.getAll);
router.get("/:id", authorize("catalog:view"), couponController.getById);
router.post("/", authorize("catalog:coupons"), couponController.create);
router.patch("/:id", authorize("catalog:coupons"), couponController.update);

export default router;
