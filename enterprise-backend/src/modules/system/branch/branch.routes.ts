import express from "express";
import branchController from "./branch.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", branchController.getAll);
router.get("/:id", branchController.getById);
router.post("/", authorize("system:branches"), branchController.create);
router.put("/:id", authorize("system:branches"), branchController.update);
router.delete("/:id", authorize("system:branches"), branchController.delete);

export default router;
