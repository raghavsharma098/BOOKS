const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
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
  
  // Status
  status: {
    type: String,
    enum: ['want_to_read', 'currently_reading', 'finished', 'dnf'],
    required: true,
  },
  
  // Progress Tracking
  pagesRead: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Dates
  startDate: {
    type: Date,
  },
  finishDate: {
    type: Date,
  },
  
  // DNF
  dnfReason: {
    type: String,
  },
  dnfDate: {
    type: Date,
  },
  
  // Reading Sessions
  sessions: [{
    date: { type: Date, default: Date.now },
    pagesRead: Number,
    timeSpent: Number, // in minutes
    mood: String,
    notes: String,
  }],
  
  // Stats
  totalReadingTime: {
    type: Number,
    default: 0, // in minutes
  },
  averageReadingSpeed: {
    type: Number,
    default: 0, // pages per hour
  },
  
  // Privacy
  isPrivate: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
readingSchema.index({ user: 1, book: 1 }, { unique: true });
readingSchema.index({ user: 1, status: 1 });
readingSchema.index({ book: 1 });
readingSchema.index({ status: 1 });

// Method to add reading session
readingSchema.methods.addSession = function(pagesRead, timeSpent, mood, notes) {
  const safePagesRead = Number(pagesRead) || 0;
  const safeTimeSpent = Number(timeSpent) || 0;

  this.sessions.push({
    date: new Date(),
    pagesRead: safePagesRead,
    timeSpent: safeTimeSpent,
    mood,
    notes,
  });

  this.pagesRead = (this.pagesRead || 0) + safePagesRead;
  this.totalReadingTime = (this.totalReadingTime || 0) + safeTimeSpent;
  // Update percentage if book has page count
  if (this.book && this.book.pageCount) {
    this.percentage = Math.min(100, (this.pagesRead / this.book.pageCount) * 100);
  }
  
  // Calculate average reading speed (pages per hour)
  if (this.totalReadingTime > 0) {
    this.averageReadingSpeed = (this.pagesRead / this.totalReadingTime) * 60;
  }
};

// Method to mark as finished
readingSchema.methods.markAsFinished = function() {
  this.status = 'finished';
  this.finishDate = new Date();
  this.percentage = 100;
};

// Method to mark as DNF
readingSchema.methods.markAsDNF = function(reason) {
  this.status = 'dnf';
  this.dnfDate = new Date();
  this.dnfReason = reason;
};

const Reading = mongoose.model('Reading', readingSchema);

module.exports = Reading;
