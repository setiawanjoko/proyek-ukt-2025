const productService = require("./productService.js");
const logger = require("../../utils/logger.js");
const { validateFields } = require("../../utils/helpers.js");
const fs = require("fs");
const path = require("path");

async function getAllProducts(req, res) {
  try {
    const { name, price, stock, includeSoftDeleted, page, limit } = req.query;
    const filters = { name, price, stock };

    const result = await productService.getAllProductsService(
      filters,
      includeSoftDeleted === "true",
      parseInt(page) || 1,
      parseInt(limit) || 10,
      req // Pass the request object for server URL mapping
    );

    res.status(200).json(result);
  } catch (err) {
    logger.error(`Error fetching products: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const result = await productService.getProductByIdService(id, req); // Pass the request object for server URL mapping

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (err) {
    logger.error(`Error fetching product by ID: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function addProduct(req, res) {
  try {
    const validationError = validateFields(
      ["name", "price", "stock"],
      req.body
    );
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const productData = req.body;
    const imageSrc = uploadProductImage(req);
    if (imageSrc) {
      productData.image = imageSrc;
    }

    const result = await productService.addProductService(productData);
    res.status(201).json(result);
  } catch (err) {
    logger.error(`Error adding product: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    
    const productData = req.body;

    const imageSrc = uploadProductImage(req);
    if (imageSrc) {
      productData.image = imageSrc;
    }

    const result = await productService.updateProductService(id, productData);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (err) {
    logger.error(`Error updating product: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await productService.deleteProductService(id);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (err) {
    logger.error(`Error deleting product: ${err.message}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

function uploadProductImage(req) {
  if (!req.file) {
    return null;
  }
  const tempPath = req.file.path;
  const targetPath = path.join(
    __dirname,
    "../../../public/img/",
    Date.now() + "-" + Math.round(Math.random() * 1e9) + req.file.originalname
  );

  try {
    fs.renameSync(tempPath, targetPath);
    return `/static/img/${req.file.originalname}`;
  } catch (err) {
    logger.error(`File upload error: ${err.message}`);
    return null;
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
