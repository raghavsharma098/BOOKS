/**
 * Moderation Routes  /api/admin/moderation
 * Access: admin | editorial_admin
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getReviewsForModeration,
  hideReview,
  unhideReview,
  deleteReview,
  dismissReviewReports,
  getCommentsForModeration,
  hideComment,
  deleteComment,
  warnUser,
  suspendUser,
  unsuspendUser,
  getClubsForModeration,
  approveClub,
  rejectClub,
  featureClub,
  suspendClub,
  removeClub,
} = require('../controllers/moderation.controller');
const { validateObjectId, validate } = require('../middleware/validator');

const isAdmin = [protect, authorize('admin', 'editorial_admin')];
const adminOnly = [protect, authorize('admin')];

// ── Reviews ──────────────────────────────────────────────────────────────────
router.get('/reviews', ...isAdmin, getReviewsForModeration);
router.patch('/reviews/:id/hide', ...isAdmin, validateObjectId('id'), validate, hideReview);
router.patch('/reviews/:id/unhide', ...isAdmin, validateObjectId('id'), validate, unhideReview);
router.delete('/reviews/:id', ...adminOnly, validateObjectId('id'), validate, deleteReview);
router.patch('/reviews/:id/dismiss-reports', ...adminOnly, validateObjectId('id'), validate, dismissReviewReports);

// ── Comments ─────────────────────────────────────────────────────────────────
router.get('/comments', ...isAdmin, getCommentsForModeration);
router.patch('/comments/:id/hide', ...isAdmin, validateObjectId('id'), validate, hideComment);
router.delete('/comments/:id', ...adminOnly, validateObjectId('id'), validate, deleteComment);

// ── Users ─────────────────────────────────────────────────────────────────────
router.post('/users/:id/warn', ...adminOnly, validateObjectId('id'), validate, warnUser);
router.post('/users/:id/suspend', ...adminOnly, validateObjectId('id'), validate, suspendUser);
router.post('/users/:id/unsuspend', ...adminOnly, validateObjectId('id'), validate, unsuspendUser);

// ── Book Clubs ────────────────────────────────────────────────────────────────
router.get('/clubs', ...isAdmin, getClubsForModeration);
router.patch('/clubs/:id/approve',  ...isAdmin,  validateObjectId('id'), validate, approveClub);
router.patch('/clubs/:id/reject',   ...isAdmin,  validateObjectId('id'), validate, rejectClub);
router.patch('/clubs/:id/feature',  ...isAdmin,  validateObjectId('id'), validate, featureClub);
router.patch('/clubs/:id/suspend',  ...adminOnly, validateObjectId('id'), validate, suspendClub);
router.delete('/clubs/:id',         ...adminOnly, validateObjectId('id'), validate, removeClub);

module.exports = router;
