import billRepository from "./bill.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { randomBytes } from "crypto";
import { Bill, NewBill } from "./bill.schema.js";

export interface CreateBillInput {
  orderId: string;
  totalAmount: string | number;
  taxAmount: string | number;
  discountAmount?: string | number;
  status?: string;
}

const billService = {
  async getAllBills(): Promise<Bill[]> {
    return await billRepository.findAll();
  },

  async getBillById(id: string): Promise<Bill> {
    const bill = await billRepository.findById(id);
    if (!bill) fail("Bill not found", 404);
    return bill!;
  },

  async getBillByOrderId(orderId: string): Promise<Bill | undefined> {
    return await billRepository.findByOrderId(orderId);
  },

  async createBill(data: CreateBillInput): Promise<Bill> {
    // Check if bill already exists for this order
    const existing = await billRepository.findByOrderId(data.orderId);
    if (existing) return existing;

    const billNo = `INV-${Date.now()}-${randomBytes(4).toString('hex')}`;
    
    const total = parseFloat(String(data.totalAmount));
    const tax = parseFloat(String(data.taxAmount));
    const discount = parseFloat(String(data.discountAmount || 0));
    const payableAmount = total + tax - discount;

    const billData: NewBill = {
      orderId: data.orderId,
      billNo,
      totalAmount: total.toFixed(2),
      taxAmount: tax.toFixed(2),
      discountAmount: discount.toFixed(2),
      payableAmount: payableAmount.toFixed(2),
      status: data.status || "Unpaid",
    };

    return await billRepository.create(billData);
  },

  async updateBillStatus(id: string, status: string): Promise<Bill | undefined> {
    await this.getBillById(id);
    return await billRepository.update(id, { status });
  }
};

export default billService;
