const express = require('express');
const router = express.Router();
const {
  getBadges,
  assignBadge,
  removeBadge,
} = require('../controllers/badge.controller');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// Public routes
router.get('/', getBadges);

// Admin routes  
router.post('/', protect, authorize('admin', 'editorial_admin'), assignBadge);
router.delete(
  '/:id',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  removeBadge
);

module.exports = router;
