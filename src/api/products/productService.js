let pool, logger;

const getPool = async () => {
  if (!pool) {
    const db = await import("../../config/db.js");
    pool = db.pool;
  }
  return pool;
};

const getLogger = async () => {
  if (!logger) {
    const loggerModule = await import("../../utils/logger.js");
    logger = loggerModule.default;
  }
  return logger;
};

// Updated buildFilters to skip undefined or empty filters
function buildFilters(filters) {
    const conditions = [];
    const values = [];
    let index = 1;
    
    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined || value === "") {
        continue; // Skip undefined or empty filters
      }

      if (field === "name") {
        conditions.push(`name ILIKE $${index++}`);
        values.push(`%${value}%`);
      } else if (["price", "stock"].includes(field)) {
        conditions.push(`${field} = $${index++}`);
        values.push(value);
      }
    }

    return { conditions, values, index };
}

async function getAllProductsService(
  filters = {},
  includeSoftDeleted = false,
  page = 1,
  limit = 10,
  req // Added req parameter for dynamic server URL mapping
) {
  try {
    const pool = await getPool();
    const logger = await getLogger();
    
    let query = "SELECT * FROM products WHERE deleted_at IS NULL";
    if (includeSoftDeleted) {
      query = "SELECT * FROM products WHERE 1=1";
    }

    const { conditions, values, index } = buildFilters(filters);
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(" AND ")}`;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY id ASC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Merge server URL with image URL using Express request object
    const products = result.rows.map((product) => {
      if (product.image_url) {
        const server_url = `${req.protocol}://${req.get("host")}`;
        product.image_url = `${server_url}${product.image_url}`;
      }
      return product;
    });

    return { success: true, products };
  } catch (err) {
    const logger = await getLogger();
    logger.error(`Get all products error: ${err.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function getProductByIdService(productId, req) {
  try {
    const pool = await getPool();
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    if (result.rows.length === 0) {
      return { success: false, message: "Product not found" };
    }

    const product = result.rows[0];
    if (product.image_url) {
        const server_url = `${req.protocol}://${req.get("host")}`;
        product.image_url = `${server_url}${product.image_url}`;
    }

    return { success: true, product };
  } catch (err) {
    const logger = await getLogger();
    logger.error(`Get product by ID error: ${err.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function addProductService(productData) {
  try {
    const pool = await getPool();
    const { name, price, stock, image } = productData;
    const result = await pool.query(
      "INSERT INTO products (name, price, stock, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, stock, image]
    );
    return { success: true, product: result.rows[0] };
  } catch (err) {
    const logger = await getLogger();
    logger.error(`Add product error: ${err.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function updateProductService(productId, productData) {
  try {
    const pool = await getPool();
    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(productData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }

    values.push(productId);
    const query = `UPDATE products SET ${fields.join(
      ", "
    )} WHERE id = $${index} AND deleted_at IS NULL RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, product: result.rows[0] };
  } catch (err) {
    const logger = await getLogger();
    logger.error(`Update product error: ${err.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function deleteProductService(productId) {
  try {
    const pool = await getPool();
    const result = await pool.query(
      "UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
      [productId]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, message: "Product deleted successfully" };
  } catch (err) {
    const logger = await getLogger();
    logger.error(`Delete product error: ${err.message}`);
    return { success: false, message: "Internal server error" };
  }
}

export {
  getAllProductsService,
  getProductByIdService,
  addProductService,
  updateProductService,
  deleteProductService,
};
