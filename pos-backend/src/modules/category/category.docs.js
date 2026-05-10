/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get categories
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create category
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Main Course" }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Category created
 *
 * /api/category/{id}:
 *   get:
 *     summary: Get category by id
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category data
 *   put:
 *     summary: Update category
 *     tags: [Category]
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
 *             properties:
 *               name: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Category updated
 *   delete:
 *     summary: Delete category
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 */

export default {};
