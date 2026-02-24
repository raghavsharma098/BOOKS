const mongoose = require('mongoose');

const reviewCommentSchema = new mongoose.Schema({
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  commentText: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

reviewCommentSchema.index({ review: 1 });
reviewCommentSchema.index({ user: 1 });
reviewCommentSchema.index({ isDeleted: 1 });

const ReviewComment = mongoose.model('ReviewComment', reviewCommentSchema);

module.exports = ReviewComment;
