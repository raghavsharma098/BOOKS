const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  updatePrivacySettings,
  updateNotificationSettings,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  deactivateAccount,
  deleteAccount,
  getUserStats,
  getUserReviews,
  getUserReadingList,
  getUserPublishedBooks,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { updateProfileValidation, validate, validateObjectId } = require('../middleware/validator');

// Protected routes
router.get('/profile', protect, function(req, res, next) {
  // Get the current user's own profile
  req.params.id = req.user._id;
  getUserProfile(req, res, next);
});
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/preferences', protect, updateProfile); // Use same controller for preferences
router.get('/preferences', protect, function(req, res, next) {
  // Get current user's preferences
  req.params.id = req.user._id;
  getUserProfile(req, res, next);
});
router.post(
  '/profile-picture',
  protect,
  uploadSingle('image'),
  handleUploadError,
  uploadProfilePicture
);
router.put('/privacy-settings', protect, updatePrivacySettings);
router.put('/notification-settings', protect, updateNotificationSettings);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/account', protect, deleteAccount);

// Public/Protected routes (can work with optional auth)
router.get('/:id', getUserProfile);
router.get('/:id/stats', getUserStats);
router.get('/:id/followers', validateObjectId('id'), validate, getFollowers);
router.get('/:id/following', validateObjectId('id'), validate, getFollowing);
router.get('/:id/reviews', validateObjectId('id'), validate, getUserReviews);
router.get('/:id/reading', validateObjectId('id'), validate, getUserReadingList);
router.get('/:id/books', validateObjectId('id'), validate, getUserPublishedBooks);

// Follow/Unfollow (protected)
router.post('/:id/follow', protect, validateObjectId('id'), validate, followUser);
router.delete('/:id/follow', protect, validateObjectId('id'), validate, unfollowUser);

module.exports = router;
