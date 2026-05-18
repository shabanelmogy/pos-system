/**
 * @swagger
 * /api/item:
 *   get:
 *     summary: Get items
 *     tags: [Item]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     summary: Create item
 *     tags: [Item]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, categoryId]
 *             properties:
 *               name: { type: string, example: "Chicken Pasta" }
 *               description: { type: string, example: "Delicious pasta with grilled chicken" }
 *               price: { type: number, example: 15.99 }
 *               images: { type: array, items: { type: string } }
 *               categoryId: { type: string }
 *     responses:
 *       201:
 *         description: Item created
 *
 * /api/item/{id}:
 *   get:
 *     summary: Get item by id
 *     tags: [Item]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item data
 *   put:
 *     summary: Update item
 *     tags: [Item]
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
 *               description: { type: string }
 *               price: { type: number }
 *               images: { type: array, items: { type: string } }
 *               categoryId: { type: string }
 *     responses:
 *       200:
 *         description: Item updated
 *   delete:
 *     summary: Delete item
 *     tags: [Item]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deleted
 */

export default {};
