import express from "express";
import categoryController from "./category.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", categoryController.getAll);
router.get("/tree", categoryController.getTree);   // Must be before /:id
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.delete);

export default router;
