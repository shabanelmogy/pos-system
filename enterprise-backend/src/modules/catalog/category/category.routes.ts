import express from "express";
import categoryController from "./category.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";
import { authorize } from "../../../../middlewares/authorize.middleware.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", authorize("catalog:view"), categoryController.getAll);
router.get("/tree", authorize("catalog:view"), categoryController.getTree);   // Must be before /:id
router.get("/:id", authorize("catalog:view"), categoryController.getById);
router.post("/", authorize("catalog:manage"), categoryController.create);
router.put("/:id", authorize("catalog:manage"), categoryController.update);
router.delete("/:id", authorize("catalog:manage"), categoryController.delete);

export default router;
