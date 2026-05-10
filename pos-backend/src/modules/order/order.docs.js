/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Get orders
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Create order
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *     responses:
 *       201:
 *         description: Order created
 *
 * /api/order/{id}:
 *   get:
 *     summary: Get order by id
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update order status
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderRequest'
 *     responses:
 *       200:
 *         description: Order updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */

export default {};
