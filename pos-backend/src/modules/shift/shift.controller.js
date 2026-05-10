import shiftService from "./shift.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { z } from "zod";

const openShiftSchema = z.object({
  branchId: z.string().uuid(),
  posPointId: z.string().uuid(),
  openingBalance: z.coerce.number().min(0),
});

const closeShiftSchema = z.object({
  closingBalance: z.coerce.number().min(0),
});

const shiftController = {
  async open(req, res) {
    try {
      console.log("[DEBUG] Opening Shift with data:", req.body, "User ID:", req.user.id);
      const validatedData = openShiftSchema.parse(req.body);
      const shift = await shiftService.openShift(
        req.user.id,
        validatedData.branchId,
        validatedData.posPointId,
        validatedData.openingBalance
      );
      res.status(201).json({ success: true, message: "Shift opened successfully", data: shift });
    } catch (error) {
      handleError(res, error, "shiftController.open");
    }
  },

  async close(req, res) {
    try {
      const { id } = req.params;
      const { closingBalance } = closeShiftSchema.parse(req.body);
      const shift = await shiftService.closeShift(id, closingBalance);
      res.status(200).json({ success: true, message: "Shift closed successfully", data: shift });
    } catch (error) {
      handleError(res, error, "shiftController.close");
    }
  },

  async getActive(req, res) {
    try {
      const { posPointId } = req.query;
      if (!posPointId) return res.status(400).json({ success: false, message: "posPointId is required" });
      const shift = await shiftService.getActiveShift(posPointId);
      res.status(200).json({ success: true, data: shift });
    } catch (error) {
      handleError(res, error, "shiftController.getActive");
    }
  }
};

export default shiftController;
