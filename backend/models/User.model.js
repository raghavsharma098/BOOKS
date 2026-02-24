const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  
  // Profile
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  profilePicture: {
    type: String,
    default: null,
  },
  
  // Authentication
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // User Role
  role: {
    type: String,
    enum: ['user', 'verified_author', 'admin', 'editorial_admin'],
    default: 'user',
  },
  
  // Preferences
  preferredGenres: [{
    type: String,
  }],
  readingPace: {
    type: String,
    enum: ['slow', 'medium', 'fast'],
    default: 'medium',
  },
  moodPreferences: [{
    type: String,
  }],
  contentAvoidance: [{
    type: String,
  }],
  
  // Reading Goals
  readingGoals: {
    yearlyTarget: {
      type: Number,
      default: 0,
    },
    currentYear: {
      type: Number,
      default: 0,
    },
    completedThisYear: {
      type: Number,
      default: 0,
    },
  },
  
  // Quiz
  quizAnswers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  quizCompletedAt: Date,
  
  // Privacy Settings
  privacySettings: {
    showReadingActivity: {
      type: Boolean,
      default: true,
    },
    showReviews: {
      type: Boolean,
      default: true,
    },
    showProfile: {
      type: Boolean,
      default: true,
    },
    allowFollowers: {
      type: Boolean,
      default: true,
    },
  },
  
  // Notification Settings
  notificationSettings: {
    email: {
      readingReminder: { type: Boolean, default: true },
      clubUpdates: { type: Boolean, default: true },
      reviewInteractions: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      giveaways: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
    },
    inApp: {
      readingReminder: { type: Boolean, default: true },
      clubUpdates: { type: Boolean, default: true },
      reviewInteractions: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      giveaways: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
    },
  },
  
  // Social
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Stats
  stats: {
    totalBooksRead: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalClubs: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  lastLoginAt: Date,
  
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate username from email
userSchema.methods.generateUsername = function() {
  const baseUsername = this.email.split('@')[0];
  this.username = baseUsername + Math.floor(Math.random() * 10000);
};

// Exclude deleted users from queries
userSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
