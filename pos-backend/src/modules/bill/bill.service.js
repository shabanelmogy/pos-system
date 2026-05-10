import billRepository from "./bill.repository.js";
import { fail } from "../../utils/errorHandler.js";

const billService = {
  async getAllBills() {
    return await billRepository.findAll();
  },

  async getBillById(id) {
    const bill = await billRepository.findById(id);
    if (!bill) fail("Bill not found", 404);
    return bill;
  },

  async getBillByOrderId(orderId) {
    return await billRepository.findByOrderId(orderId);
  },

  async createBill(data) {
    // Check if bill already exists for this order
    const existing = await billRepository.findByOrderId(data.orderId);
    if (existing) return existing;

    const billNo = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const payableAmount = parseFloat(data.totalAmount) + parseFloat(data.taxAmount) - parseFloat(data.discountAmount || 0);

    const billData = {
      ...data,
      billNo,
      payableAmount: payableAmount.toFixed(2),
      totalAmount: parseFloat(data.totalAmount).toFixed(2),
      taxAmount: parseFloat(data.taxAmount).toFixed(2),
    };

    return await billRepository.create(billData);
  },

  async updateBillStatus(id, status) {
    const bill = await this.getBillById(id);
    return await billRepository.update(id, { status });
  }
};

export default billService;
