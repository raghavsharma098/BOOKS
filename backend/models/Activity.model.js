const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // User who performed the activity
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Activity Type
  type: {
    type: String,
    enum: [
      'finished_book',
      'started_book',
      'added_to_tbr',
      'reviewed_book',
      'joined_club',
      'created_club',
      'followed_user',
      'liked_review',
      'commented_review',
      'achievement',
    ],
    required: true,
  },
  
  // Activity Description
  description: {
    type: String,
    required: true,
  },
  
  // Related Entities
  relatedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  relatedReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  },
  relatedClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookClub',
  },
  
  // Visibility
  isPrivate: {
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
}, {
  timestamps: true,
});

// Indexes
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ isPrivate: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
