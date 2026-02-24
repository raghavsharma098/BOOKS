const express = require('express');
const router = express.Router();
const {
  getActivityFeed,
  getUserActivity,
  likeActivity,
} = require('../controllers/community.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// Protected routes
router.get('/feed', protect, getActivityFeed);
router.post('/activity/:id/like', protect, validateObjectId('id'), validate, likeActivity);

// Public routes
router.get('/activity/:userId', optionalAuth, validateObjectId('userId'), validate, getUserActivity);

module.exports = router;
