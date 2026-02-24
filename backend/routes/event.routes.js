const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  rsvpEvent,
  updateEventStatus,
  featureEvent,
} = require('../controllers/event.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { createEventValidation, validate, validateObjectId } = require('../middleware/validator');

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, validateObjectId('id'), validate, getEvent);

// Protected routes (Verified Author/Admin)
router.post(
  '/',
  protect,
  authorize('verified_author', 'admin'),
  uploadSingle('coverImage'),
  handleUploadError,
  createEventValidation,
  validate,
  createEvent
);
router.post('/:id/rsvp', protect, validateObjectId('id'), validate, rsvpEvent);

// Admin routes
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  updateEventStatus
);
router.put(
  '/:id/feature',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  featureEvent
);

module.exports = router;
