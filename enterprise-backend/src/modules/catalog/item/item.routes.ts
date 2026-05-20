import express from "express";
import itemController from "./item.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", authorize("catalog:view"), itemController.getAll);
router.get("/:id", authorize("catalog:view"), itemController.getById);
router.post("/", authorize("catalog:manage"), itemController.create);
router.put("/:id", authorize("catalog:manage"), itemController.update);
router.delete("/:id", authorize("catalog:manage"), itemController.delete);

export default router;
