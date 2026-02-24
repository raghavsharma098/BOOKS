const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  discussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClubDiscussion',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    maxlength: [1000, 'Reply cannot exceed 1000 characters'],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

discussionReplySchema.index({ discussion: 1 });
discussionReplySchema.index({ user: 1 });

const DiscussionReply = mongoose.model('DiscussionReply', discussionReplySchema);

module.exports = DiscussionReply;
