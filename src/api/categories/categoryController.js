const categoryService = require("./categoryService");

async function getAllCategories(req, res) {
  try {
    const { includeSoftDeleted, page, limit } = req.query;
    const result = await categoryService.getAllCategoriesService(
      includeSoftDeleted === "true",
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const result = await categoryService.getCategoryByIdService(parseInt(id));
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getProductsByCategoryId(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    const { includeSoftDeleted, page, limit } = req.query;
    const result = await categoryService.getProductsByCategoryIdService(
      parseInt(id),
      includeSoftDeleted === "true",
      parseInt(page) || 1,
      parseInt(limit) || 10,
      req
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function addCategory(req, res) {
  try {
    const categoryData = req.body;
    const result = await categoryService.addCategoryService(categoryData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const categoryData = req.body;
    const result = await categoryService.updateCategoryService(
      parseInt(id),
      categoryData
    );
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deactivateCategory(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const result = await categoryService.deactivateCategoryService(
      parseInt(id)
    );
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function reactivateCategory(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const result = await categoryService.reactivateCategoryService(
      parseInt(id)
    );
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    const result = await categoryService.deleteCategoryService(parseInt(id));
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getProductsByCategoryId,
  addCategory,
  updateCategory,
  deactivateCategory,
  reactivateCategory,
  deleteCategory,
};
