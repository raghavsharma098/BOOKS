const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  updateBookStatus,
  setEditorialBadge,
  getPopularBooks,
  getTrendingBooksWeekly,
  getBookEditions,
} = require('../controllers/book.controller');
const {
  submitBook,
  getMySubmissions,
} = require('../controllers/adminBook.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { createBookValidation, validate, validateObjectId } = require('../middleware/validator');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/popular', getPopularBooks);
router.get('/trending', getTrendingBooksWeekly);
router.get('/', optionalAuth, getBooks);
router.get('/:id/editions', validateObjectId('id'), validate, optionalAuth, getBookEditions);
router.get('/:id', validateObjectId('id'), validate, optionalAuth, getBook);

// ── User: submit a book for review (restricted fields, status=pending) ────────
router.post(
  '/submit',
  protect,
  uploadSingle('coverImage'),
  handleUploadError,
  submitBook
);

// User: view their own submitted books
router.get('/my-submissions', protect, getMySubmissions);

// ── Legacy create (kept for compatibility, also handles admin creates) ────────
router.post(
  '/',
  protect,
  uploadSingle('coverImage'),
  handleUploadError,
  createBookValidation,
  validate,
  createBook
);
router.put(
  '/:id',
  protect,
  uploadSingle('coverImage'),
  handleUploadError,
  validateObjectId('id'),
  validate,
  updateBook
);
router.delete('/:id', protect, validateObjectId('id'), validate, deleteBook);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  updateBookStatus
);
router.put(
  '/:id/editorial-badge',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  setEditorialBadge
);

module.exports = router;

module.exports = router;
