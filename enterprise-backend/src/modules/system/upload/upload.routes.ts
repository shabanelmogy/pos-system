import express from "express";
import uploadController from "./upload.controller.js";
import { isVerifiedUser } from "../../../../middlewares/tokenVerification.js";

const router = express.Router();

router.post("/", isVerifiedUser, uploadController.uploadImage);

export default router;
