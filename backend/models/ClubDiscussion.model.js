const mongoose = require('mongoose');

const clubDiscussionSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookClub',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  
  // Thread Info
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true,
  },
  chapterNumber: {
    type: Number,
  },
  chapterTitle: {
    type: String,
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Initial Post
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters'],
  },
  
  // Spoiler Warning
  containsSpoilers: {
    type: Boolean,
    default: false,
  },
  
  // Thread Stats
  replyCount: {
    type: Number,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  
  // Moderation
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
clubDiscussionSchema.index({ club: 1 });
clubDiscussionSchema.index({ book: 1 });
clubDiscussionSchema.index({ createdBy: 1 });
clubDiscussionSchema.index({ lastActivityAt: -1 });

const ClubDiscussion = mongoose.model('ClubDiscussion', clubDiscussionSchema);

module.exports = ClubDiscussion;
