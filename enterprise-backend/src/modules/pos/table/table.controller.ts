import { Request, Response } from "express";
import tableService from "./table.service.js";
import { handleError } from "../../../utils/errorHandler.js";
import { createTableSchema, updateTableSchema } from "./table.validation.js";

const tableController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tables = await tableService.getAllTables();
      res.status(200).json({ success: true, data: tables });
    } catch (error) {
      handleError(res, error as any, "tableController.getAll");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createTableSchema.parse(req.body);
      const newTable = await tableService.createTable(validatedData as any);
      res.status(201).json({ success: true, message: req.t("table.created"), data: newTable });
    } catch (error) {
      handleError(res, error as any, "tableController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      console.log(`[DEBUG] Table Update - ID: ${id}, Body:`, req.body);
      const validatedData = updateTableSchema.parse(req.body);
      const updatedTable = await tableService.updateTable(id, validatedData as any);
      res.status(200).json({ success: true, message: req.t("table.updated"), data: updatedTable });
    } catch (error) {
      handleError(res, error as any, "tableController.update");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await tableService.deleteTable(id);
      res.status(200).json({ success: true, message: req.t("table.deleted") });
    } catch (error) {
      handleError(res, error as any, "tableController.delete");
    }
  }
};

export default tableController;
