import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string().uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  orderId: z.string().uuid(),
});
