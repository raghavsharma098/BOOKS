const express = require('express');
const router = express.Router();
const {
  getAuthors,
  getAuthor,
  claimAuthor,
  updateClaimStatus,
  updateAuthor,
  followAuthor,
  getClaimRequests,
  getMyClaim,
} = require('../controllers/author.controller');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { validateObjectId, validate } = require('../middleware/validator');

// Public routes
router.get('/', getAuthors);

// Authenticated user's own claim status (must come before /:id wildcard)
router.get('/my-claim', protect, getMyClaim);

// Admin routes (must come before /:id wildcard)
router.get(
  '/claim-requests',
  protect,
  authorize('admin', 'editorial_admin'),
  getClaimRequests
);

router.get('/:id', validateObjectId('id'), validate, getAuthor);

// Protected routes
router.post('/:id/claim', protect, validateObjectId('id'), validate, claimAuthor);
router.post('/:id/follow', protect, validateObjectId('id'), validate, followAuthor);
router.put(
  '/:id',
  protect,
  authorize('verified_author', 'admin', 'editorial_admin'),
  uploadSingle('profilePhoto'),
  handleUploadError,
  validateObjectId('id'),
  validate,
  updateAuthor
);

// Admin routes
router.put(
  '/:id/claim-status',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  updateClaimStatus
);

module.exports = router;
