const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { signupValidation, loginValidation, validate } = require('../middleware/validator');

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.post('/resend-verification', protect, resendVerification);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
