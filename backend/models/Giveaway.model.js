const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Giveaway title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Giveaway description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  coverImage: {
    type: String,
  },

  // Giveaway Type
  giveawayType: {
    type: String,
    enum: ['physical_book', 'ebook', 'merch'],
    default: 'physical_book',
  },

  // Book(s) — single shorthand kept for backward compat, books[] is canonical
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  },
  books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  
  // Timeline
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  
  // Winners
  numberOfWinners: {
    type: Number,
    required: [true, 'Number of winners is required'],
    min: 1,
    default: 1,
  },
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    selectedAt: {
      type: Date,
      default: Date.now,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Entry Management
  entries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    enteredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  entryCount: {
    type: Number,
    default: 0,
  },
  maxEntries: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  
  // Eligibility
  eligibilityCriteria: {
    minBooksRead: {
      type: Number,
      default: 0,
    },
    minReviews: {
      type: Number,
      default: 0,
    },
    mustBeFollower: {
      type: Boolean,
      default: false,
    },
    country: [String],
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'active', 'ended', 'winners_selected'],
    default: 'draft',
  },
  rejectionReason: { type: String },
  
  // Created By
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Flags
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
giveawaySchema.index({ status: 1 });
giveawaySchema.index({ startDate: 1 });
giveawaySchema.index({ endDate: 1 });
giveawaySchema.index({ book: 1 });
giveawaySchema.index({ createdBy: 1 });
giveawaySchema.index({ 'entries.user': 1 });

// Method to add entry
giveawaySchema.methods.addEntry = function(userId) {
  const existingEntry = this.entries.find(e => e.user.toString() === userId.toString());
  
  if (!existingEntry) {
    this.entries.push({ user: userId });
    this.entryCount += 1;
    return true;
  }
  return false;
};

// Method to select winners randomly
giveawaySchema.methods.selectWinners = function() {
  if (this.entries.length === 0) {
    throw new Error('No entries to select winners from');
  }
  
  const count = Math.min(this.numberOfWinners, this.entries.length);
  const shuffled = [...this.entries].sort(() => 0.5 - Math.random());
  const selectedWinners = shuffled.slice(0, count);
  
  this.winners = selectedWinners.map(entry => ({
    user: entry.user,
    selectedAt: new Date(),
    notified: false,
  }));
  
  this.status = 'winners_selected';
};

const Giveaway = mongoose.model('Giveaway', giveawaySchema);

module.exports = Giveaway;
