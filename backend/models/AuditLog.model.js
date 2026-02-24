const mongoose = require('mongoose');

/**
 * AuditLog - Records every admin action on books (approve/reject/edit/create).
 * Used for compliance, moderation accountability, and debugging.
 */
const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // What was done
  action: {
    type: String,
    enum: [
      'book_approved',
      'book_rejected',
      'book_edited_before_approval',
      'book_created_by_admin',
      'book_deleted',
      'book_badge_set',
      'author_verified',
      'author_claim_approved',
      'author_claim_rejected',
    ],
    required: true,
  },

  // The target resource
  targetModel: {
    type: String,
    enum: ['Book', 'Author'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  // Snapshot before change (for edits)
  before: {
    type: mongoose.Schema.Types.Mixed,
  },

  // Snapshot after change
  after: {
    type: mongoose.Schema.Types.Mixed,
  },

  // Optional reason / note attached to the action
  reason: {
    type: String,
    trim: true,
  },

  // IP for security audit purposes
  ip: String,
}, {
  timestamps: true,
});

auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
