import express from "express";
import orderController from "./order.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", orderController.getAll);
router.get("/:id", orderController.getById);
router.post("/", orderController.create);
router.put("/:id", orderController.updateStatus);

export default router;
