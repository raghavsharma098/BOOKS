const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getAIRecommendations,
  getTrendingBooks,
  getSimilarBooks,
  getByMood,
} = require('../controllers/recommendation.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// Public routes
router.get('/trending', optionalAuth, getTrendingBooks);
router.get('/similar/:bookId', optionalAuth, validateObjectId('bookId'), validate, getSimilarBooks);
router.get('/mood/:mood', optionalAuth, getByMood);

// Protected routes
router.get('/', protect, getRecommendations);
router.get('/ai', protect, getAIRecommendations);

module.exports = router;
