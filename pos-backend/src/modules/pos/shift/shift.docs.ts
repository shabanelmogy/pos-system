/**
 * @swagger
 * /api/shift/active:
 *   get:
 *     summary: Get active shift for a terminal
 *     tags: [Shift]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: posPointId
 *         in: query
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Active shift data or null
 *
 * /api/shift/open:
 *   post:
 *     summary: Open a new shift
 *     tags: [Shift]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OpenShiftRequest'
 *     responses:
 *       201:
 *         description: Shift opened successfully
 *
 * /api/shift/close/{id}:
 *   post:
 *     summary: Close an existing shift
 *     tags: [Shift]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloseShiftRequest'
 *     responses:
 *       200:
 *         description: Shift closed successfully
 */

export default {};
