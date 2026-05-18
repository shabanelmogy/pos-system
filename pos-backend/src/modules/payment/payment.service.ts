import Razorpay from "razorpay";
import config from "../../../config/config.js";
import crypto from "crypto";
import paymentRepository from "./payment.repository.js";
import orderService from "../order/order.service.js";
import { fail } from "../../utils/errorHandler.js";

let razorpay: any;
if (config.razorpayKeyId && config.razorpaySecretKey) {
  razorpay = new (Razorpay as any)({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpaySecretKey,
  });
} else {
  console.warn("Razorpay keys are missing. Payment module will not function correctly.");
}

const paymentService = {
  async createRazorpayOrder(amount: number, internalOrderId: string): Promise<any> {
    if (!razorpay) fail("Razorpay is not configured", 500);
    const options = {
      amount: Math.round(amount * 100), // Amount in paisa
      currency: "INR",
      receipt: internalOrderId,
      notes: {
        internalOrderId: internalOrderId
      }
    };

    return await razorpay.orders.create(options);
  },

  async verifySignature(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpaySecretKey!)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (expectedSignature !== signature) {
      fail("Payment verification failed", 400);
    }
    return true;
  },

  async processWebhook(body: any, signature: string): Promise<boolean> {
    const secret = config.razorpyWebhookSecret || "";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      fail("Invalid webhook signature", 400);
    }

    if (body.event === "payment.captured") {
      const payment = body.payload.payment.entity;
      const internalOrderId = payment.notes?.internalOrderId || body.payload.order?.entity?.receipt;

      await paymentRepository.create({
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: (payment.amount / 100).toString(),
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email || null,
        contact: payment.contact || null,
        createdAt: new Date(payment.created_at * 1000)
      } as any);

      if (internalOrderId) {
        // Mocking a system actor ID for webhook updates
        const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000"; 
        await orderService.updatePaymentStatus(internalOrderId, "PAID", { userId: SYSTEM_ACTOR_ID });
      }
    }
    return true;
  }
};

export default paymentService;
