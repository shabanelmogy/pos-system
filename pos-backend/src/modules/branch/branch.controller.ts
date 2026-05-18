import { Request, Response } from "express";
import branchService from "./branch.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createBranchSchema, updateBranchSchema } from "./branch.validation.js";

const branchController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const branches = await branchService.getAllBranches();
      res.status(200).json({ success: true, data: branches });
    } catch (error) {
      handleError(res, error as any, "branchController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const branch = await branchService.getBranchById(id);
      res.status(200).json({ success: true, data: branch });
    } catch (error) {
      handleError(res, error as any, "branchController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createBranchSchema.parse(req.body);
      const newBranch = await branchService.createBranch(validatedData as any);
      res.status(201).json({ success: true, message: "Branch created successfully", data: newBranch });
    } catch (error) {
      handleError(res, error as any, "branchController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateBranchSchema.parse(req.body);
      const updatedBranch = await branchService.updateBranch(id, validatedData as any);
      res.status(200).json({ success: true, message: "Branch updated successfully", data: updatedBranch });
    } catch (error) {
      handleError(res, error as any, "branchController.update");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await branchService.deleteBranch(id);
      res.status(200).json({ success: true, message: "Branch deleted successfully" });
    } catch (error) {
      handleError(res, error as any, "branchController.delete");
    }
  }
};

export default branchController;
