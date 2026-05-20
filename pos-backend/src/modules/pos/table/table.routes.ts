import express from "express";
import tableController from "./table.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", tableController.getAll);
router.post("/", tableController.create);
router.put("/:id", tableController.update);
router.delete("/:id", tableController.delete);

export default router;
