const express = require('express');
const router = express.Router();
const {
  getGiveaways,
  getGiveaway,
  createGiveaway,
  enterGiveaway,
  selectWinners,
  updateGiveaway,
  publishGiveaway,
  closeGiveaway,
  getGiveawayEntries,
  setWinnersManually,
  deleteGiveaway,
} = require('../controllers/giveaway.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { createGiveawayValidation, validate, validateObjectId } = require('../middleware/validator');

const isAdmin = [protect, authorize('admin', 'editorial_admin')];

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, getGiveaways);
router.get('/:id', optionalAuth, validateObjectId('id'), validate, getGiveaway);

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/:id/enter', protect, validateObjectId('id'), validate, enterGiveaway);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.post(
  '/',
  ...isAdmin,
  uploadSingle('coverImage'),
  handleUploadError,
  createGiveawayValidation,
  validate,
  createGiveaway
);
router.put(
  '/:id',
  ...isAdmin,
  validateObjectId('id'),
  validate,
  uploadSingle('coverImage'),
  handleUploadError,
  updateGiveaway
);
router.patch('/:id/publish',   ...isAdmin, validateObjectId('id'), validate, publishGiveaway);
router.patch('/:id/close',     ...isAdmin, validateObjectId('id'), validate, closeGiveaway);
router.get('/:id/entries',     ...isAdmin, validateObjectId('id'), validate, getGiveawayEntries);
router.post('/:id/select-winners', ...isAdmin, validateObjectId('id'), validate, selectWinners);
router.post('/:id/manual-winners', ...isAdmin, validateObjectId('id'), validate, setWinnersManually);
router.delete('/:id',          protect, authorize('admin'), validateObjectId('id'), validate, deleteGiveaway);

module.exports = router;

