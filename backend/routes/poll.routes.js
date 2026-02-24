const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getActivePoll,
  getAllPolls,
  createPoll,
  updatePoll,
  deletePoll,
  castVote,
} = require('../controllers/poll.controller');

// Public – get active poll (optionally pass token for userVotedBook)
router.get('/active', (req, res, next) => {
  // Optionally attach user if token present, but don't block unauthenticated
  const jwt = require('jsonwebtoken');
  const User = require('../models/User.model');
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).select('-password').then(user => {
        if (user) req.user = user;
        next();
      }).catch(() => next());
    } catch {
      next();
    }
  } else {
    next();
  }
}, getActivePoll);

// Admin routes
router.get('/', protect, authorize('admin', 'editorial_admin'), getAllPolls);
router.post('/', protect, authorize('admin', 'editorial_admin'), createPoll);
router.put('/:id', protect, authorize('admin', 'editorial_admin'), updatePoll);
router.delete('/:id', protect, authorize('admin', 'editorial_admin'), deletePoll);

// Vote (authenticated users)
router.post('/:id/vote', protect, castVote);

module.exports = router;
