import posSettingsService from "./posSettings.service.js";
import { handleError } from "../../utils/errorHandler.js";

const posSettingsController = {
  async getAll(req, res) {
    try {
      console.log(`[DEBUG] GET /api/pos-settings (All Sync)`);
      const allSettings = await posSettingsService.getAllAndSync();
      res.status(200).json({ success: true, data: allSettings });
    } catch (error) {
      console.error(`[ERROR] GET /api/pos-settings:`, error);
      handleError(res, error, "posSettingsController.getAll");
    }
  },

  async get(req, res) {
    try {
      const { posPointId } = req.params;
      console.log(`[DEBUG] GET /api/pos-settings/${posPointId}`);
      const settings = await posSettingsService.getSettings(posPointId);
      console.log(`[DEBUG] Settings found:`, !!settings);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      console.error(`[ERROR] GET /api/pos-settings/${req.params.posPointId}:`, error);
      handleError(res, error, "posSettingsController.get");
    }
  },

  async update(req, res) {
    try {
      const { posPointId } = req.params;
      console.log(`[DEBUG] PATCH /api/pos-settings/${posPointId}`);
      const updatedSettings = await posSettingsService.updateSettings(posPointId, req.body);
      res.status(200).json({ 
        success: true, 
        message: "Settings updated successfully", 
        data: updatedSettings 
      });
    } catch (error) {
      console.error(`[ERROR] PATCH /api/pos-settings/${req.params.posPointId}:`, error);
      handleError(res, error, "posSettingsController.update");
    }
  }
};

export default posSettingsController;
