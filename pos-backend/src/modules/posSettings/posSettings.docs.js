/**
 * @swagger
 * /api/pos-settings:
 *   get:
 *     summary: Get settings for all terminals
 *     tags: [POS Settings]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all terminal settings
 *
 * /api/pos-settings/{posPointId}:
 *   get:
 *     summary: Get settings for a specific terminal
 *     tags: [POS Settings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: posPointId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Terminal settings
 *   patch:
 *     summary: Update settings for a specific terminal
 *     tags: [POS Settings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: posPointId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/POSSettingsRequest'
 *     responses:
 *       200:
 *         description: Settings updated
 */

export default {};
