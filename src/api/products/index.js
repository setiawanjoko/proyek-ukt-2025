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

routes.get("/", getAllProducts);

routes.get("/:id", getProductById);

routes.post("/", authMiddleware, requireRole('admin'), addProduct);

routes.put("/:id", authMiddleware, requireRole('admin'), updateProduct);

routes.delete("/:id", authMiddleware, requireRole('admin'), deleteProduct);

module.exports = routes;
} catch (err) {
  console.error('Error loading products module:', err.message);
  module.exports = require('express').Router();
}