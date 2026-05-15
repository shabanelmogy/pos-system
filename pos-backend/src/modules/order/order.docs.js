/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Get orders (filtered by branch for non-admins)
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lifecycle
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, VOIDED, CANCELLED]
 *       - in: query
 *         name: fulfillmentStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, PREPARING, PARTIALLY_READY, READY, SERVED, DISPATCHED, DELIVERED, PICKED_UP]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [UNPAID, PARTIALLY_PAID, PAID, REFUNDED]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DINE_IN, TAKE_AWAY, DELIVERY, QR_SELF, PHONE]
 *       - in: query
 *         name: tableId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of orders. Note that for performance reasons, this endpoint returns a slim representation of orders without their associated order items. A `slim: true` flag is included in the response. Use GET /api/orders/{id} to retrieve a full order with items.
 *
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
 *       404:
 *         description: Order not found
 *
 * /api/order/{id}/confirm:
 *   patch:
 *     summary: Confirm a DRAFT order (move to ACTIVE)
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
 *         description: Order confirmed
 *
 * /api/order/{id}/fulfillment:
 *   patch:
 *     summary: Update fulfillment status (Kitchen/Service)
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PREPARING, PARTIALLY_READY, READY, SERVED, DISPATCHED, PICKED_UP, DELIVERED]
 *               notes:
 *                 type: string
 *               reasonCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fulfillment updated
 *       422:
 *         description: Illegal state transition
 *
 * /api/order/{id}/lifecycle:
 *   patch:
 *     summary: Update lifecycle status (Management/Audit)
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
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, VOIDED, CANCELLED]
 *               settleWithCash:
 *                 type: boolean
 *                 description: If true, record a cash payment for balance before completion
 *               notes:
 *                 type: string
 *               reasonCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lifecycle updated
 *       403:
 *         description: Forbidden (Manager role required for VOIDED)
 *       422:
 *         description: Illegal state transition or outstanding balance
 *
 * /api/order/{id}/print:
 *   post:
 *     summary: Record a bill print event
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
 *         description: Print recorded
 *
 * /api/order/{id}/apply-coupon:
 *   post:
 *     summary: Apply a coupon to the order
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
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied
 *
 * /api/order/{id}/add-payment:
 *   post:
 *     summary: Record a payment against the order
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
 *             type: object
 *             required: [amount, method]
 *             properties:
 *               amount:
 *                 type: string
 *                 example: "50.00"
 *               method:
 *                 type: string
 *                 enum: [Cash, Card, UPI, Other]
 *     responses:
 *       200:
 *         description: Payment recorded
 *
 * /api/order/{id}/refund:
 *   post:
 *     summary: Refund and void the entire order
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
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order refunded and voided
 *
 * /api/order/{id}/move-table:
 *   post:
 *     summary: Move a DINE_IN order to another table
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
 *             type: object
 *             required: [targetTableId]
 *             properties:
 *               targetTableId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Table moved
 *
 * /api/order/{id}/merge:
 *   post:
 *     summary: Merge another order into this one
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
 *             type: object
 *             required: [targetOrderId]
 *             properties:
 *               targetOrderId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Orders merged
 *
 * /api/order/{id}/split:
 *   post:
 *     summary: Split selected items into a new order
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
 *             type: object
 *             required: [itemIds]
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Items split into new order
 *
 * /api/order/{id}/items:
 *   post:
 *     summary: Add an item to an active order
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
 *             $ref: '#/components/schemas/OrderItemRequest'
 *     responses:
 *       200:
 *         description: Item added
 *
 * /api/order/{id}/items/{itemId}:
 *   patch:
 *     summary: Update item quantity
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quantity updated
 *
 *   delete:
 *     summary: Remove item from order
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 *
 * /api/order/{id}/items/{itemId}/void:
 *   patch:
 *     summary: Void a specific item with reason
 *     tags: [Order]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item voided
 */

export default {};
