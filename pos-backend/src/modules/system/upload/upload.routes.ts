import express from "express";
import uploadController from "./upload.controller.js";

const router = express.Router();

router.post("/", uploadController.uploadImage);

export default router;
