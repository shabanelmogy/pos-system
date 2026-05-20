import { Router } from "express";
import couponController from "./coupon.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = Router();

// All coupon routes require authentication
router.use(isVerifiedUser);

router.get("/validate", couponController.validate);
router.get("/", couponController.getAll);
router.get("/:id", couponController.getById);
router.post("/", couponController.create);
router.patch("/:id", couponController.update);

export default router;
