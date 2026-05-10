/**
 * @swagger
 * /api/table:
 *   get:
 *     summary: Get tables
 *     tags: [Table]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tables
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create table
 *     tags: [Table]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TableRequest'
 *     responses:
 *       201:
 *         description: Table created
 *       401:
 *         description: Unauthorized
 *
 * /api/table/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Table]
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
 *             $ref: '#/components/schemas/UpdateTableRequest'
 *     responses:
 *       200:
 *         description: Table updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table not found
 */

export default {};
