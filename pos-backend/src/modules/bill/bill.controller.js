import billService from "./bill.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createBillSchema, updateBillStatusSchema } from "./bill.validation.js";

const billController = {
  async getAll(req, res) {
    try {
      const bills = await billService.getAllBills();
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      handleError(res, error, "billController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const bill = await billService.getBillById(req.params.id);
      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      handleError(res, error, "billController.getById");
    }
  },

  async getByOrderId(req, res) {
    try {
      const bill = await billService.getBillByOrderId(req.params.orderId);
      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      handleError(res, error, "billController.getByOrderId");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createBillSchema.parse(req.body);
      const newBill = await billService.createBill(validatedData);
      res.status(201).json({ success: true, data: newBill });
    } catch (error) {
      handleError(res, error, "billController.create");
    }
  },

  async updateStatus(req, res) {
    try {
      const validatedData = updateBillStatusSchema.parse(req.body);
      const updatedBill = await billService.updateBillStatus(req.params.id, validatedData.status);
      res.status(200).json({ success: true, data: updatedBill });
    } catch (error) {
      handleError(res, error, "billController.updateStatus");
    }
  }
};

export default billController;
