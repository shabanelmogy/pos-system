import { Router } from "express";
import configController from "./config.controller.js";

const router = Router();

// Profiles
router.get("/profiles", configController.getAll);
router.get("/profiles/:id", configController.getById);
router.post("/profiles", configController.create);
router.put("/profiles/:id", configController.update);
router.delete("/profiles/:id", configController.delete);

// Assignments
router.get("/assignments", configController.getAssignments);
router.post("/assignments", configController.createAssignment);
router.delete("/assignments/:id", configController.deleteAssignment);

export default router;
