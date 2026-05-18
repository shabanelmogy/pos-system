/**
 * @swagger
 * /api/bill:
 *   get:
 *     summary: Get all bills
 *     description: >
 *       Retrieve a complete list of all transaction bills recorded in the system.
 *       Use this endpoint in the Admin Dashboard or Billing History screens to let managers
 *       monitor sales, payment states, and print historical records.
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of bills successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, description: "Indicates if the request was handled successfully", example: true }
 *                 data:
 *                   type: array
 *                   description: "List of all bill records"
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *   post:
 *     summary: Create a new bill for an order
 *     description: >
 *       Generate a new commercial bill invoice for an active restaurant order. 
 *       Call this endpoint during checkout or when generating the invoice receipt for the customer.
 *       It will calculate the final payable amount, incorporate tax, and apply any discounts.
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: "Billing sub-totals and state values"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, totalAmount, taxAmount]
 *             properties:
 *               orderId: { type: string, format: uuid, description: "The UUID primary key of the order to bill" }
 *               totalAmount: { type: number, description: "Gross sum total of all items in the order before tax/discounts" }
 *               taxAmount: { type: number, description: "Calculated tax value applied to this bill (e.g. 15% VAT)" }
 *               discountAmount: { type: number, description: "Optional discount deduction value (defaults to 0.00)" }
 *               status: { type: string, enum: ["Paid", "Unpaid"], description: "Initial payment status. Use 'Unpaid' if checkout is pending payment." }
 *     responses:
 *       201:
 *         description: Bill invoice created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, description: "Indicates success of the bill generation", example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 *
 * /api/bill/{id}:
 *   get:
 *     summary: Get bill by ID
 *     description: >
 *       Fetch detailed properties of a single bill record by its primary key UUID.
 *       Use this when displaying details of a past sale or opening a digital receipt modal for a specific bill.
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "The primary key UUID of the Bill record you wish to retrieve"
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detailed bill data fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, description: "Request completion status", example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 *
 * /api/bill/order/{orderId}:
 *   get:
 *     summary: Get bill by Order ID
 *     description: >
 *       Query the bill associated with a specific Order UUID. 
 *       Use this in the checkout flow to see if a bill has already been created for an active table order,
 *       or to retrieve the printable invoice data for a customer's active session.
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: "The UUID of the Order whose associated bill you want to fetch"
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The associated order bill was found and returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, description: "Request completion status", example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 *
 * /api/bill/status/{id}:
 *   patch:
 *     summary: Update bill payment status
 *     description: >
 *       Update the payment status of an invoice. Call this endpoint on the frontend
 *       when a payment gateway confirms success, or when cash is received by the cashier
 *       to transition the bill status.
 *     tags: [Bill]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: "The primary key UUID of the Bill you want to update"
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       description: "The new payment status to transition to"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: ["Paid", "Partially Paid", "Unpaid"], description: "The new target payment status. Use 'Paid' when fully paid." }
 *     responses:
 *       200:
 *         description: Payment status transitioned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, description: "Request completion status", example: true }
 *                 data:
 *                   $ref: '#/components/schemas/Bill'
 */

export default {};

