const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  profilePhoto: {
    type: String,
  },
  socialLinks: {
    website: String,
    twitter: String,
    instagram: String,
    facebook: String,
    goodreads: String,
  },
  
  // Verification
  status: {
    type: String,
    enum: ['auto_created', 'unclaimed', 'claim_requested', 'verified', 'rejected'],
    default: 'auto_created',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  claimRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  claimEmail: {
    type: String,
    trim: true,
  },
  claimProof: {
    type: String,
    trim: true,
  },
  
  // Stats
  totalBooks: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // System
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    enum: ['system', 'user', 'admin'],
    default: 'system',
  },
}, {
  timestamps: true,
});

authorSchema.index({ name: 1 });
authorSchema.index({ claimedBy: 1 });
authorSchema.index({ isVerified: 1 });
authorSchema.index({ isDeleted: 1 });

// Text search index
authorSchema.index({ name: 'text', bio: 'text' });

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
