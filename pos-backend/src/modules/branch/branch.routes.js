import express from "express";
import branchRepository from "./branch.repository.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", async (req, res) => {
  const data = await branchRepository.findAll();
  res.json({ success: true, data });
});

router.post("/", async (req, res) => {
  const data = await branchRepository.create(req.body);
  res.json({ success: true, data });
});

export default router;
