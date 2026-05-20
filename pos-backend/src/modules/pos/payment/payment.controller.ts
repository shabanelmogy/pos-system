import { Request, Response } from "express";
import paymentService from "./payment.service.js";
import orderService from "../../pos/order/order.service.js";
import { handleError } from "../../../utils/errorHandler.js";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./payment.validation.js";

const paymentController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, orderId } = createPaymentOrderSchema.parse(req.body);
      const order = await paymentService.createRazorpayOrder(amount, orderId);
      res.status(200).json({ success: true, order });
    } catch (error) {
      handleError(res, error as any, "paymentController.createOrder");
    }
  },

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = verifyPaymentSchema.parse(req.body);
      await paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      // Update order status to PAID
      await orderService.updatePaymentStatus(orderId, "PAID", { userId: req.user!.id });

      res.status(200).json({ success: true, message: req.t("payment.verified") });
    } catch (error) {
      handleError(res, error as any, "paymentController.verifyPayment");
    }
  },

  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      await paymentService.processWebhook(req.body, signature);
      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error as any, "paymentController.webhook");
    }
  }
};

export default paymentController;
