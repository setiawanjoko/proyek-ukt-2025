const { Router } = require('express');
const {
  getAllCategories,
  getCategoryById,
  getProductsByCategoryId,
  addCategory,
  updateCategory,
  deactivateCategory,
  reactivateCategory,
  deleteCategory
} = require('./categoryController');
const authMiddleware = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

const router = new Router();

router.get('/', authMiddleware, getAllCategories);
router.get('/:id', authMiddleware, getCategoryById);
router.get('/:id/products', authMiddleware, getProductsByCategoryId);
router.post('/', authMiddleware, requireRole('admin'), addCategory);
router.put('/:id', authMiddleware, requireRole('admin'), updateCategory);
router.patch('/:id/deactivate', authMiddleware, requireRole('admin'), deactivateCategory);
router.patch('/:id/reactivate', authMiddleware, requireRole('admin'), reactivateCategory);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategory);

module.exports = router;