import tableService from "./table.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createTableSchema, updateTableSchema } from "./table.validation.js";

const tableController = {
  async getAll(req, res) {
    try {
      const tables = await tableService.getAllTables();
      res.status(200).json({ success: true, data: tables });
    } catch (error) {
      handleError(res, error, "tableController.getAll");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createTableSchema.parse(req.body);
      const newTable = await tableService.createTable(validatedData);
      res.status(201).json({ success: true, message: "Table created successfully", data: newTable });
    } catch (error) {
      handleError(res, error, "tableController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateTableSchema.parse(req.body);
      const updatedTable = await tableService.updateTable(id, validatedData);
      res.status(200).json({ success: true, message: "Table updated successfully", data: updatedTable });
    } catch (error) {
      handleError(res, error, "tableController.update");
    }
  }
};

export default tableController;
