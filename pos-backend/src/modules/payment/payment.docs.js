/**
 * @swagger
 * /api/payment/create-order:
 *   post:
 *     summary: Create Razorpay order
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentOrderRequest'
 *     responses:
 *       200:
 *         description: Razorpay order created
 *       401:
 *         description: Unauthorized
 *
 * /api/payment/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Payment]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Payment verification failed
 *       401:
 *         description: Unauthorized
 *
 * /api/payment/webhook-verification:
 *   post:
 *     summary: Razorpay webhook verification
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Webhook verified
 *       400:
 *         description: Invalid signature
 */

export default {};
