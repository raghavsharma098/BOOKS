const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Poll title is required'],
    trim: true,
    default: "Best Choice's of Reader",
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  // Admin-selected books for the poll (2-4 books)
  books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      voteCount: {
        type: Number,
        default: 0,
      },
    },
  ],
  // Track which user voted for which book (one vote per user)
  userVotes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      votedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);
