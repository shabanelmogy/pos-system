import posPointService from "./posPoint.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createPOSPointSchema, updatePOSPointSchema } from "./posPoint.validation.js";

const posPointController = {
  async getAll(req, res) {
    try {
      const { branchId } = req.query;
      const points = await posPointService.getAllPOSPoints(branchId);
      res.status(200).json({ success: true, data: points });
    } catch (error) {
      handleError(res, error, "posPointController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const point = await posPointService.getPOSPointById(req.params.id);
      res.status(200).json({ success: true, data: point });
    } catch (error) {
      handleError(res, error, "posPointController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createPOSPointSchema.parse(req.body);
      const newPoint = await posPointService.createPOSPoint(validatedData);
      res.status(201).json({ success: true, message: "Terminal created successfully", data: newPoint });
    } catch (error) {
      handleError(res, error, "posPointController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updatePOSPointSchema.parse(req.body);
      const updatedPoint = await posPointService.updatePOSPoint(id, validatedData);
      res.status(200).json({ success: true, message: "Terminal updated successfully", data: updatedPoint });
    } catch (error) {
      handleError(res, error, "posPointController.update");
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await posPointService.deletePOSPoint(id);
      res.status(200).json({ success: true, message: "Terminal deleted successfully" });
    } catch (error) {
      handleError(res, error, "posPointController.delete");
    }
  }
};

export default posPointController;
