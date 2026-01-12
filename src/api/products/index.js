/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints (use "webadmin@example.com" and "password" for admin access)
 */

try {
  const { Router } = require("express");
  const {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  } = require("./productController.js");
  const authMiddleware = require("../../middleware/authMiddleware");
  const { requireRole } = require("../../middleware/roleMiddleware");
  const routes = new Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by product name
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Filter by product price
 *       - in: query
 *         name: stock
 *         schema:
 *           type: number
 *         description: Filter by product stock
 *       - in: query
 *         name: includeSoftDeleted
 *         schema:
 *           type: boolean
 *         description: Include soft-deleted products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Internal server error
 */
routes.get("/", getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
routes.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
routes.post("/", authMiddleware, requireRole('admin'), addProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
routes.put("/:id", authMiddleware, requireRole('admin'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
routes.delete("/:id", authMiddleware, requireRole('admin'), deleteProduct);

module.exports = routes;
} catch (err) {
  console.error('Error loading products module:', err.message);
  module.exports = require('express').Router();
}