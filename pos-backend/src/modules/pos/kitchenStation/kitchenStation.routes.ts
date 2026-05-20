import express from "express";
import kitchenStationController from "./kitchenStation.controller.js";

const router = express.Router();

router.get("/", kitchenStationController.getAll);
router.get("/:id", kitchenStationController.getById);
router.post("/", kitchenStationController.create);
router.put("/:id", kitchenStationController.update);
router.delete("/:id", kitchenStationController.delete);

export default router;
