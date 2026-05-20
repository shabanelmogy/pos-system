import express from "express";
import billController from "./bill.controller.js";

const router = express.Router();

router.get("/", billController.getAll);
router.get("/:id", billController.getById);
router.get("/order/:orderId", billController.getByOrderId);
router.post("/", billController.create);
router.patch("/status/:id", billController.updateStatus);

export default router;
