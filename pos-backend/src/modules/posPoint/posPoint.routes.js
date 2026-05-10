import express from "express";
import posPointRepository from "./posPoint.repository.js";
import { isVerifiedUser } from "../../../middlewares/tokenVerification.js";

const router = express.Router();

router.use(isVerifiedUser);

router.get("/", async (req, res) => {
  const { branchId } = req.query;
  const data = await posPointRepository.findAll(branchId);
  res.json({ success: true, data });
});

router.post("/", async (req, res) => {
  const data = await posPointRepository.create(req.body);
  res.json({ success: true, data });
});

export default router;
