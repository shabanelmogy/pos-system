/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PERCENTAGE, FIXED]
 *         value:
 *           type: string
 *         minOrderAmount:
 *           type: string
 *         maxDiscountAmount:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         validUntil:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         usageLimitPerCustomer:
 *           type: integer
 *           nullable: true
 *         totalUsageLimit:
 *           type: integer
 *           nullable: true
 *         usageCount:
 *           type: integer
 * 
 * /api/coupon:
 *   get:
 *     summary: Get all coupons (Admin/Manager)
 *     tags: [Coupon]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Coupon'
 * 
 *   post:
 *     summary: Create a new coupon (Admin/Manager)
 *     tags: [Coupon]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, type, value]
 *             properties:
 *               code: { type: string }
 *               type: { type: string, enum: [PERCENTAGE, FIXED] }
 *               value: { type: string }
 *               minOrderAmount: { type: string }
 *               maxDiscountAmount: { type: string, nullable: true }
 *               isActive: { type: boolean }
 *               validUntil: { type: string, format: date-time, nullable: true }
 *               usageLimitPerCustomer: { type: integer, nullable: true }
 *               totalUsageLimit: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Coupon created
 * 
 * /api/coupon/{id}:
 *   get:
 *     summary: Get coupon by ID (Admin/Manager)
 *     tags: [Coupon]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Coupon details
 * 
 *   patch:
 *     summary: Update an existing coupon (Admin/Manager)
 *     tags: [Coupon]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               isActive: { type: boolean }
 *               validUntil: { type: string, format: date-time, nullable: true }
 *     responses:
 *       200:
 *         description: Coupon updated
 * 
 * /api/coupon/validate:
 *   get:
 *     summary: Validate a coupon code
 *     tags: [Coupon]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: orderAmount
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valid coupon details
 *       422:
 *         description: Invalid, inactive, or expired coupon
 */

export default {};
