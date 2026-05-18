import express from "express";
import branchController from "./branch.controller.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", branchController.getAll);
router.get("/:id", branchController.getById);
router.post("/", branchController.create);
router.put("/:id", branchController.update);
router.delete("/:id", branchController.delete);

export default router;
