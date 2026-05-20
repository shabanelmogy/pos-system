/**
 * @swagger
 * /api/pos-point:
 *   get:
 *     summary: Get all terminals (POS Points)
 *     tags: [POS Point]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: branchId
 *         in: query
 *         schema: { type: string }
 *         description: Filter by branch ID
 *     responses:
 *       200:
 *         description: List of terminals
 *   post:
 *     summary: Create a new terminal
 *     tags: [POS Point]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/POSPointRequest'
 *     responses:
 *       201:
 *         description: Terminal created
 *
 * /api/pos-point/{id}:
 *   get:
 *     summary: Get terminal by id
 *     tags: [POS Point]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Terminal data
 *   put:
 *     summary: Update terminal
 *     tags: [POS Point]
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
 *             $ref: '#/components/schemas/POSPointRequest'
 *     responses:
 *       200:
 *         description: Terminal updated
 *   delete:
 *     summary: Delete terminal
 *     tags: [POS Point]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Terminal deleted
 */

export default {};
