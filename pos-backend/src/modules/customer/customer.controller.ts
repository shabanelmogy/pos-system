import { Request, Response } from "express";
import customerService from "./customer.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createCustomerSchema, updateCustomerSchema } from "./customer.validation.js";

const customerController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      handleError(res, error as any, "customerController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const customer = await customerService.getCustomerById(id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      handleError(res, error as any, "customerController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCustomerSchema.parse(req.body);
      const newCustomer = await customerService.createCustomer(validatedData as any);
      res.status(201).json({ success: true, message: req.t("customer.created"), data: newCustomer });
    } catch (error) {
      handleError(res, error as any, "customerController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateCustomerSchema.parse(req.body);
      const updatedCustomer = await customerService.updateCustomer(id, validatedData as any);
      res.status(200).json({ success: true, message: req.t("customer.updated"), data: updatedCustomer });
    } catch (error) {
      handleError(res, error as any, "customerController.update");
    }
  }
};

export default customerController;
