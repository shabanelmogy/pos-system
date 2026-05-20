import express from "express";
import tableController from "./table.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", tableController.getAll);
router.post("/", authorize("pos:manage_tables"), tableController.create);
router.put("/:id", authorize("pos:manage_tables"), tableController.update);
router.delete("/:id", authorize("pos:manage_tables"), tableController.delete);

export default router;
