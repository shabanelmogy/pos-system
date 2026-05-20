import express from "express";
import itemController from "./item.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", itemController.getAll);
router.get("/:id", itemController.getById);
router.post("/", itemController.create);
router.put("/:id", itemController.update);
router.delete("/:id", itemController.delete);

export default router;
