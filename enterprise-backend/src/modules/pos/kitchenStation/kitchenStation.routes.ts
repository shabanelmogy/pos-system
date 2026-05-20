import express from "express";
import kitchenStationController from "./kitchenStation.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", kitchenStationController.getAll);
router.get("/:id", kitchenStationController.getById);
router.post("/", authorize("pos:manage_kitchen"), kitchenStationController.create);
router.put("/:id", authorize("pos:manage_kitchen"), kitchenStationController.update);
router.delete("/:id", authorize("pos:manage_kitchen"), kitchenStationController.delete);

export default router;
