import { Request, Response } from "express";
import posPointService from "./posPoint.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createPOSPointSchema, updatePOSPointSchema } from "./posPoint.validation.js";

const posPointController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const branchId = req.query.branchId as string | undefined;
      const points = await posPointService.getAllPOSPoints(branchId);
      res.status(200).json({ success: true, data: points });
    } catch (error) {
      handleError(res, error as any, "posPointController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const point = await posPointService.getPOSPointById(id);
      res.status(200).json({ success: true, data: point });
    } catch (error) {
      handleError(res, error as any, "posPointController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createPOSPointSchema.parse(req.body);
      const newPoint = await posPointService.createPOSPoint(validatedData as any);
      res.status(201).json({ success: true, message: req.t("posPoint.created"), data: newPoint });
    } catch (error) {
      handleError(res, error as any, "posPointController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updatePOSPointSchema.parse(req.body);
      const updatedPoint = await posPointService.updatePOSPoint(id, validatedData as any);
      res.status(200).json({ success: true, message: req.t("posPoint.updated"), data: updatedPoint });
    } catch (error) {
      handleError(res, error as any, "posPointController.update");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await posPointService.deletePOSPoint(id);
      res.status(200).json({ success: true, message: req.t("posPoint.deleted") });
    } catch (error) {
      handleError(res, error as any, "posPointController.delete");
    }
  }
};

export default posPointController;
