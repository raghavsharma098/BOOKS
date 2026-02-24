const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'reading_reminder',
      'club_update',
      'club_invitation',
      'review_like',
      'review_comment',
      'follow',
      'editorial_recommendation',
      'giveaway_result',
      'giveaway_winner',
      'event_reminder',
      'event_update',
      'badge_assigned',
      'book_approved',
      'book_rejected',
      'author_claim_approved',
      'author_claim_rejected',
      'general',
    ],
    required: true,
  },
  
  // Content
  title: {
    type: String,
    required: true,
  },
  message: {
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
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  relatedGiveaway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Giveaway',
  },
  
  // Action URL
  actionUrl: {
    type: String,
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  
  // Email Sent
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 }); // For cleanup of old notifications

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
