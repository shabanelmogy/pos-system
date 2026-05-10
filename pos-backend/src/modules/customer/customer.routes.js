import express from "express";
import customerController from "./customer.controller.js";

const router = express.Router();

router.get("/", customerController.getAll);
router.get("/:id", customerController.getById);
router.post("/", customerController.create);
router.put("/:id", customerController.update);

export default router;
