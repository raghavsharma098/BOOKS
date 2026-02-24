const express = require('express');
const router = express.Router();
const {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  addComment,
  reportReview,
} = require('../controllers/review.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { createReviewValidation, validate, validateObjectId } = require('../middleware/validator');

// Public routes
router.get('/book/:bookId', optionalAuth, validateObjectId('bookId'), validate, getBookReviews);

// Protected routes
router.post('/', protect, createReviewValidation, validate, createReview);
router.put('/:id', protect, validateObjectId('id'), validate, updateReview);
router.delete('/:id', protect, validateObjectId('id'), validate, deleteReview);
router.post('/:id/like', protect, validateObjectId('id'), validate, toggleLike);
router.post('/:id/comments', protect, validateObjectId('id'), validate, addComment);
router.post('/:id/report', protect, validateObjectId('id'), validate, reportReview);

module.exports = router;
