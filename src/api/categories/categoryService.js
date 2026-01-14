const { add } = require("winston");

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

async function getAllCategoriesService(
  includeSoftDeleted = false,
  page = 1,
  limit = 10
) {
  try {
    const pool = await getPool();

    let query = "SELECT * FROM categories WHERE deleted_at IS NULL";
    if (includeSoftDeleted) {
      query = "SELECT * FROM categories WHERE 1=1";
    }

    query += " ORDER BY id ASC";
    const offset = (page - 1) * limit;
    query += ` LIMIT $1 OFFSET $2`;
    const values = [limit, offset];
    const result = await pool.query(query, values);

    return {
      success: true,
      message: "Categories retrieved successfully",
      data: result.rows,
      page,
      limit,
    };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Get all categories error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function getCategoryByIdService(categoryId) {
  try {
    const pool = await getPool();
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [
      categoryId,
    ]);
    if (result.rows.length === 0) {
      return { success: false, message: "Category not found" };
    }
    return {
      success: true,
      message: "Category retrieved successfully",
      data: result.rows[0],
    };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Get category by ID error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function getProductsByCategoryIdService(
  categoryId,
  includeSoftDeleted = false,
  page = 1,
  limit = 10,
  req
) {
  try {
    const pool = await getPool();
    let query =
      "SELECT * FROM products WHERE category_id = $1 AND deleted_at IS NULL";
    const values = [categoryId];
    const result = await pool.query(query, values);
    return {
      success: true,
      message: "Products retrieved successfully",
      data: result.rows,
    };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Get products by category ID error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function addCategoryService(categoryData) {
  try {
    const pool = await getPool();
    const { name, description } = categoryData;
    const result = await pool.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
      [name, description]
    );
    return {
      success: true,
      message: "Category added successfully",
      categoryId: result.rows[0].id,
    };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Add category error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function updateCategoryService(categoryId, categoryData) {
  try {
    const pool = await getPool();
    const { name, description } = categoryData;
    const result = await pool.query(
      "UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 AND deleted_at IS NULL RETURNING *",
      [name, description, categoryId]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "Category not found" };
    }
    return { success: true, category: result.rows[0] };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Update category error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function deactivateCategoryService(categoryId) {
  try {
    const pool = await getPool();
    const result = await pool.query(
      "UPDATE categories SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
      [categoryId]
    );
    if (result.rows.length === 0) {
      return { success: false, message: "Category not found" };
    }
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Delete category error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function reactivateCategoryService(categoryId) {
  try {
    const pool = await getPool();
    const result = await pool.query(
      "UPDATE categories SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *",
      [categoryId]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "Category not found" };
    }
    return { success: true, message: "Category reactivated successfully" };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Reactivate category error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

async function deleteCategoryService(categoryId) {
  // This function can only delete a deactivated category
  // This function will change all products under this category to have category_id = 1
  // Category with id = 1 is considered as "Uncategorized" and cannot be deleted
  try {
    const pool = await getPool();
    const deleteResult = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *",
      [categoryId]
    );
    if (deleteResult.rows.length === 0) {
      return {
        success: false,
        message: "Category not found or not deactivated",
      };
    }
    const result = await pool.query(
      "UPDATE products SET category_id = 1 WHERE category_id = $1 RETURNING *",
      [categoryId]
    );
    return {
      success: true,
      message:
        "Category deleted successfully. All products have been moved to the 'Uncategorized' category.",
    };
  } catch (error) {
    const logger = await getLogger();
    logger.error(`Delete category error: ${error.message}`);
    return { success: false, message: "Internal server error" };
  }
}

module.exports = {
  getAllCategoriesService,
  getCategoryByIdService,
  getProductsByCategoryIdService,
  addCategoryService,
  updateCategoryService,
  deactivateCategoryService,
  reactivateCategoryService,
  deleteCategoryService,
};
