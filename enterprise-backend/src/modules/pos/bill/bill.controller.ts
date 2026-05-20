import { Request, Response } from "express";
import billService from "./bill.service.js";
import { handleError } from "../../../utils/errorHandler.js";
import { createBillSchema, updateBillStatusSchema } from "./bill.validation.js";

const billController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const bills = await billService.getAllBills();
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      handleError(res, error as any, "billController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const bill = await billService.getBillById(id);
      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      handleError(res, error as any, "billController.getById");
    }
  },

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId as string;
      const bill = await billService.getBillByOrderId(orderId);
      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      handleError(res, error as any, "billController.getByOrderId");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createBillSchema.parse(req.body);
      const newBill = await billService.createBill(validatedData);
      res.status(201).json({ success: true, data: newBill });
    } catch (error) {
      handleError(res, error as any, "billController.create");
    }
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateBillStatusSchema.parse(req.body);
      const updatedBill = await billService.updateBillStatus(id, validatedData.status);
      res.status(200).json({ success: true, data: updatedBill });
    } catch (error) {
      handleError(res, error as any, "billController.updateStatus");
    }
  }
};

export default billController;
