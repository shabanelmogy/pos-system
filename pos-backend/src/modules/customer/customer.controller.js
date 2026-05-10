import customerService from "./customer.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createCustomerSchema, updateCustomerSchema } from "./customer.validation.js";

const customerController = {
  async getAll(req, res) {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      handleError(res, error, "customerController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      handleError(res, error, "customerController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createCustomerSchema.parse(req.body);
      const newCustomer = await customerService.createCustomer(validatedData);
      res.status(201).json({ success: true, message: "Customer created successfully", data: newCustomer });
    } catch (error) {
      handleError(res, error, "customerController.create");
    }
  },

  async update(req, res) {
    try {
      const validatedData = updateCustomerSchema.parse(req.body);
      const updatedCustomer = await customerService.updateCustomer(req.params.id, validatedData);
      res.status(200).json({ success: true, message: "Customer updated successfully", data: updatedCustomer });
    } catch (error) {
      handleError(res, error, "customerController.update");
    }
  }
};

export default customerController;
