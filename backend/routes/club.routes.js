const express = require('express');
const router = express.Router();
const {
  getClubs,
  getClub,
  getMyClubs,
  createClub,
  joinClub,
  leaveClub,
  createDiscussion,
  getDiscussions,
  addReply,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  updateMemberProgress,
} = require('../controllers/club.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadSingle, uploadFields, handleUploadError } = require('../middleware/upload');
const { createClubValidation, validate, validateObjectId } = require('../middleware/validator');

// Public routes
router.get('/', optionalAuth, getClubs);
router.get('/mine', protect, getMyClubs);  // must come before /:id
router.get('/:id', optionalAuth, validateObjectId('id'), validate, getClub);
router.get('/:id/discussions', optionalAuth, validateObjectId('id'), validate, getDiscussions);

// Protected routes
router.post(
  '/',
  protect,
  uploadFields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'clubLogo',   maxCount: 1 },
  ]),
  handleUploadError,
  createClubValidation,
  validate,
  createClub
);
router.post('/:id/join', protect, validateObjectId('id'), validate, joinClub);
router.delete('/:id/members', protect, validateObjectId('id'), validate, leaveClub);
router.get('/:id/requests', protect, validateObjectId('id'), validate, getJoinRequests);
router.post('/:id/requests/:userId/accept', protect, validateObjectId('id'), validate, acceptJoinRequest);
router.delete('/:id/requests/:userId', protect, validateObjectId('id'), validate, rejectJoinRequest);
router.post('/:id/discussions', protect, validateObjectId('id'), validate, createDiscussion);
router.post('/discussions/:id/replies', protect, validateObjectId('id'), validate, addReply);
router.patch('/:id/progress', protect, validateObjectId('id'), validate, updateMemberProgress);

module.exports = router;
