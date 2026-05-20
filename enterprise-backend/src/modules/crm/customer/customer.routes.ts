import express from "express";
import customerController from "./customer.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", authorize("crm:view"), customerController.getAll);
router.get("/:id", authorize("crm:view"), customerController.getById);
router.post("/", authorize("crm:manage"), customerController.create);
router.put("/:id", authorize("crm:manage"), customerController.update);

export default router;
