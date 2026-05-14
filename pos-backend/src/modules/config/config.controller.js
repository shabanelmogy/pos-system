import configRepository from "./config.repository.js";
import { handleError } from "../../utils/errorHandler.js";

const configController = {
  // Profiles
  async getAll(req, res) {
    try {
      const profiles = await configRepository.findAll();
      res.status(200).json({ success: true, data: profiles });
    } catch (error) {
      handleError(res, error, "configController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const profile = await configRepository.findById(id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      handleError(res, error, "configController.getById");
    }
  },

  async create(req, res) {
    try {
      const userId = req.user?.id || "00000000-0000-0000-0000-000000000000";
      const profile = await configRepository.create(userId, req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      console.error("[ERROR] configController.create:", error);
      handleError(res, error, "configController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const profile = await configRepository.update(id, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      handleError(res, error, "configController.update");
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await configRepository.delete(id);
      res.status(200).json({ success: true, message: "Profile deleted successfully" });
    } catch (error) {
      handleError(res, error, "configController.delete");
    }
  },

  // Assignments
  async getAssignments(req, res) {
    try {
      const { profileId } = req.query;
      const assignments = await configRepository.getAssignments(profileId);
      res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      handleError(res, error, "configController.getAssignments");
    }
  },

  async createAssignment(req, res) {
    try {
      const assignment = await configRepository.assignProfile(req.body);
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      console.error("[ERROR] configController.createAssignment:", error);
      handleError(res, error, "configController.createAssignment");
    }
  },

  async deleteAssignment(req, res) {
    try {
      const { id } = req.params;
      await configRepository.deleteAssignment(id);
      res.status(200).json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
      handleError(res, error, "configController.deleteAssignment");
    }
  },

  async configurePricing(req, res) {
    try {
      const { profileId } = req.params;
      const { rules } = req.body;
      const result = await configRepository.setPriceRules(profileId, rules);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, "configController.configurePricing");
    }
  }
};

export default configController;
