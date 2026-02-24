const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  
  // Rating
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 0,
    max: 5,
  },
  
  // Emotional Reaction
  emotionalReaction: {
    type: String,
    enum: ['loved', 'liked', 'neutral', 'disliked', 'hated'],
  },
  
  // Structured Review
  structuredReview: {
    writingQuality: {
      type: Number,
      min: 0,
      max: 5,
    },
    emotionalImpact: {
      type: Number,
      min: 0,
      max: 5,
    },
    pacing: {
      type: Number,
      min: 0,
      max: 5,
    },
    characterDepth: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  
  // Review Text
  reviewText: {
    type: String,
    maxlength: [2000, 'Review cannot exceed 2000 characters'],
  },
  
  // Flags
  containsSpoilers: {
    type: Boolean,
    default: false,
  },
  
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  
  // Survey fields (collected at review time)
  pace: { type: String, enum: ['slow', 'medium', 'fast'] },
  plotDriven: { type: String, enum: ['yes', 'complicated', 'no', 'na'] },
  loveableCharacters: { type: String, enum: ['yes', 'complicated', 'no', 'na'] },
  diverseCast: { type: String, enum: ['yes', 'complicated', 'no', 'na'] },
  flawsFocus: { type: String, enum: ['yes', 'complicated', 'no', 'na'] },

  // Moderation
  isReported: {
    type: Boolean,
    default: false,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Status
  isHidden: {
    type: Boolean,
    default: false,
  },
  hiddenReason: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ user: 1, book: 1 }, { unique: true });
reviewSchema.index({ book: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ likeCount: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isDeleted: 1, isHidden: 1 });

// Method to add like
reviewSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likeCount += 1;
  }
};

// Method to remove like
reviewSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likeCount -= 1;
  }
};

// Method to add report
reviewSchema.methods.addReport = function(userId, reason) {
  this.reports.push({ user: userId, reason });
  this.reportCount += 1;
  this.isReported = true;
};

// Exclude deleted/hidden reviews
reviewSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeHidden) {
    this.where({ isDeleted: false, isHidden: false });
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
