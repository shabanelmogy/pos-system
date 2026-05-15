import paymentService from "./payment.service.js";
import orderService from "../order/order.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./payment.validation.js";

const paymentController = {
  async createOrder(req, res) {
    try {
      const { amount, orderId } = createPaymentOrderSchema.parse(req.body);
      const order = await paymentService.createRazorpayOrder(amount, orderId);
      res.status(200).json({ success: true, order });
    } catch (error) {
      handleError(res, error, "paymentController.createOrder");
    }
  },

  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = verifyPaymentSchema.parse(req.body);
      await paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      
      // Update order status to PAID
      await orderService.updatePaymentStatus(orderId, "PAID", { userId: req.user.id });

      res.status(200).json({ success: true, message: "Payment verified and order updated!" });
    } catch (error) {
      handleError(res, error, "paymentController.verifyPayment");
    }
  },

  async webhook(req, res) {
    try {
      const signature = req.headers["x-razorpay-signature"];
      await paymentService.processWebhook(req.body, signature);
      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error, "paymentController.webhook");
    }
  }
};

export default paymentController;
