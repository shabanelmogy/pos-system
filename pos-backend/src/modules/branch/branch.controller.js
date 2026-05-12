import branchService from "./branch.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createBranchSchema, updateBranchSchema } from "./branch.validation.js";

const branchController = {
  async getAll(req, res) {
    try {
      const branches = await branchService.getAllBranches();
      res.status(200).json({ success: true, data: branches });
    } catch (error) {
      handleError(res, error, "branchController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const branch = await branchService.getBranchById(req.params.id);
      res.status(200).json({ success: true, data: branch });
    } catch (error) {
      handleError(res, error, "branchController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createBranchSchema.parse(req.body);
      const newBranch = await branchService.createBranch(validatedData);
      res.status(201).json({ success: true, message: "Branch created successfully", data: newBranch });
    } catch (error) {
      handleError(res, error, "branchController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateBranchSchema.parse(req.body);
      const updatedBranch = await branchService.updateBranch(id, validatedData);
      res.status(200).json({ success: true, message: "Branch updated successfully", data: updatedBranch });
    } catch (error) {
      handleError(res, error, "branchController.update");
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await branchService.deleteBranch(id);
      res.status(200).json({ success: true, message: "Branch deleted successfully" });
    } catch (error) {
      handleError(res, error, "branchController.delete");
    }
  }
};

export default branchController;
