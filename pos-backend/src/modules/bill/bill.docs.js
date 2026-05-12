/**
 * @swagger
 * /api/bill:
 *   get:
 *     summary: Get all bills
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of bills
 *   post:
 *     summary: Create a new bill for an order
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, totalAmount, taxAmount]
 *             properties:
 *               orderId: { type: string, format: uuid }
 *               totalAmount: { type: number }
 *               taxAmount: { type: number }
 *               discountAmount: { type: number }
 *               status: { type: string, enum: [Paid, Unpaid] }
 *     responses:
 *       201:
 *         description: Bill created
 *
 * /api/bill/order/{orderId}:
 *   get:
 *     summary: Get bill by Order ID
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bill data
 *
 * /api/bill/status/{id}:
 *   patch:
 *     summary: Update bill payment status
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: ["Paid", "Partially Paid", "Unpaid"] }
 *     responses:
 *       200:
 *         description: Status updated
 */

export default {};
