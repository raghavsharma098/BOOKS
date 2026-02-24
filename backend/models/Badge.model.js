const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // Badge Type
  type: {
    type: String,
    enum: ['book_of_week', 'book_of_month', 'reader_of_month', 'editorial_pick', 'custom'],
    required: true,
  },
  
  // Badge Info
  name: {
    type: String,
    required: [true, 'Badge name is required'],
  },
  description: {
    type: String,
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
    default: '#FFD700',
  },
  
  // Assignment
  assignedTo: {
    type: String,
    enum: ['book', 'user'],
    required: true,
  },
  targetBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Timeline
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  
  // Assigned By (Admin only)
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
badgeSchema.index({ type: 1 });
badgeSchema.index({ assignedTo: 1 });
badgeSchema.index({ targetBook: 1 });
badgeSchema.index({ targetUser: 1 });
badgeSchema.index({ expiresAt: 1 });
badgeSchema.index({ isActive: 1, isDeleted: 1 });

// Check if badge is expired
badgeSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
