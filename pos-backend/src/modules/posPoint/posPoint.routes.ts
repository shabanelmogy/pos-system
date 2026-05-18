import express from "express";
import posPointController from "./posPoint.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", posPointController.getAll);
router.get("/:id", posPointController.getById);
router.post("/", posPointController.create);
router.put("/:id", posPointController.update);
router.delete("/:id", posPointController.delete);

export default router;
