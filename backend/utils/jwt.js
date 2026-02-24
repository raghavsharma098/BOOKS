const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken.model');

// Generate JWT Access Token
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate Refresh Token
exports.generateRefreshToken = async (userId, ipAddress) => {
  // Create refresh token
  const token = crypto.randomBytes(40).toString('hex');
  
  // Calculate expiry (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Save to database
  const refreshToken = await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    createdByIp: ipAddress,
  });
  
  return token;
};

// Verify Refresh Token
exports.verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token }).populate('user');
  
  if (!refreshToken || !refreshToken.isTokenActive()) {
    throw new Error('Invalid refresh token');
  }
  
  return refreshToken;
};

// Revoke Token
exports.revokeToken = async (token, ipAddress) => {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (!refreshToken || !refreshToken.isTokenActive()) {
    throw new Error('Token not found or already revoked');
  }
  
  refreshToken.revokedAt = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.isActive = false;
  await refreshToken.save();
};

// Revoke all user tokens
exports.revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, isActive: true },
    { isActive: false, revokedAt: Date.now() }
  );
};

// Generate Email Verification Token
exports.generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return { token, hashedToken };
};

// Generate Password Reset Token
exports.generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return { token, hashedToken };
};

// Send Token Response
exports.sendTokenResponse = (user, statusCode, res, refreshToken = null) => {
  const accessToken = this.generateAccessToken(user._id);
  
  const response = {
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      profilePicture: user.profilePicture,
      preferredGenres: user.preferredGenres || [],
    },
  };
  
  if (refreshToken) {
    response.refreshToken = refreshToken;
  }
  
  res.status(statusCode).json(response);
};
