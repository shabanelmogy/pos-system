/**
 * @swagger
 * /api/branch:
 *   get:
 *     summary: Get all branches
 *     tags: [Branch]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchRequest'
 *     responses:
 *       201:
 *         description: Branch created
 *
 * /api/branch/{id}:
 *   get:
 *     summary: Get branch by id
 *     tags: [Branch]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Branch data
 *   put:
 *     summary: Update branch
 *     tags: [Branch]
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
 *             $ref: '#/components/schemas/BranchRequest'
 *     responses:
 *       200:
 *         description: Branch updated
 *   delete:
 *     summary: Delete branch
 *     tags: [Branch]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Branch deleted
 */

export default {};
