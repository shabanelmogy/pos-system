import { Request, Response } from "express";
import shiftService from "./shift.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { openShiftSchema, closeShiftSchema } from "./shift.validation.js";

const shiftController = {
  async open(req: Request, res: Response): Promise<void> {
    try {
      console.log("[DEBUG] Opening Shift with data:", req.body, "User ID:", req.user?.id);
      
      // Ensure cashierId is present (default to logged-in user)
      if (!req.body.cashierId && req.user) {
        req.body.cashierId = req.user.id;
      }
      
      const validatedData = openShiftSchema.parse(req.body);
      const shift = await shiftService.openShift(
        validatedData.cashierId,
        validatedData.branchId,
        validatedData.posPointId,
        validatedData.openingBalance
      );
      res.status(201).json({ success: true, message: "Shift opened successfully", data: shift });
    } catch (error) {
      handleError(res, error as any, "shiftController.open");
    }
  },

  async close(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { closingBalance } = closeShiftSchema.parse(req.body);
      const shift = await shiftService.closeShift(id, closingBalance);
      res.status(200).json({ success: true, message: "Shift closed successfully", data: shift });
    } catch (error) {
      handleError(res, error as any, "shiftController.close");
    }
  },

  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const posPointId = req.query.posPointId as string | undefined;
      if (!posPointId) {
        res.status(400).json({ success: false, message: "posPointId is required" });
        return;
      }
      const shift = await shiftService.getActiveShift(posPointId);
      res.status(200).json({ success: true, data: shift });
    } catch (error) {
      handleError(res, error as any, "shiftController.getActive");
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const shifts = await shiftService.getAllShifts(filters);
      res.status(200).json({ success: true, data: shifts });
    } catch (error) {
      handleError(res, error as any, "shiftController.getAll");
    }
  },

  async getReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const report = await shiftService.getReconciliation(id);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      handleError(res, error as any, "shiftController.getReconciliation");
    }
  }
};

export default shiftController;
