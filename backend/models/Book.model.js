const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required'],
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'English',
  },
  coverImage: {
    type: String,
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1'],
  },
  
  // Classification
  genres: [{
    type: String,
  }],
  moodTags: [{
    type: String,
  }],
  readingPace: {
    type: String,
    enum: ['slow', 'medium', 'fast'],
    default: 'medium',
  },
  contentWarnings: [{
    type: String,
  }],
  
  // Publishing
  publicationDate: {
    type: Date,
  },
  publisher: String,
  format: {
    type: String,
    enum: ['Paperback', 'Hardcover', 'eBook', 'Audiobook', 'Audio CD', 'Board Book'],
    default: 'Paperback',
  },
  editors: [{ type: String }],
  buyLink: { type: String },
  images: [{ type: String }],
  
  // Ratings & Reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  ratingDistribution: {
    5: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    1: { type: Number, default: 0 },
  },
  
  // Status
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,

  // Submission metadata (user-submitted books)
  submissionNote: {
    type: String,
    maxlength: [500, 'Note cannot exceed 500 characters'],
    trim: true,
  },

  // Approval / rejection audit trail
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectedAt: Date,
  
  // Editorial
  editorialBadge: {
    type: String,
    enum: [null, 'pick', 'recommended', 'featured'],
    default: null,
  },
  
  // Creation Info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  
  // Stats
  views: {
    type: Number,
    default: 0,
  },
  // Weekly views counter – reset automatically every 7 days via the trending endpoint
  weeklyViews: {
    type: Number,
    default: 0,
  },
  weeklyViewsLastReset: {
    type: Date,
    default: Date.now,
  },
  wantToReadCount: {
    type: Number,
    default: 0,
  },
  currentlyReadingCount: {
    type: Number,
    default: 0,
  },
  finishedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ isbn: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ genres: 1 });
bookSchema.index({ moodTags: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ views: -1 });
bookSchema.index({ weeklyViews: -1 });
bookSchema.index({ isDeleted: 1 });
bookSchema.index({ createdBy: 1 });

// Text search index
bookSchema.index({ title: 'text', subtitle: 'text', description: 'text' });

// Compound indexes for common queries
bookSchema.index({ status: 1, isDeleted: 1 });
bookSchema.index({ genres: 1, averageRating: -1 });

// Method to update average rating
bookSchema.methods.updateRating = function(newRating, oldRating = null) {
  if (oldRating !== null) {
    // Update existing rating
    const totalRatingScore = this.averageRating * this.totalRatings;
    const newTotalScore = totalRatingScore - oldRating + newRating;
    this.averageRating = newTotalScore / this.totalRatings;
  } else {
    // New rating
    const totalRatingScore = this.averageRating * this.totalRatings;
    this.totalRatings += 1;
    this.averageRating = (totalRatingScore + newRating) / this.totalRatings;
  }
  
  // Round to 2 decimal places
  this.averageRating = Math.round(this.averageRating * 100) / 100;
};

// Exclude deleted books
bookSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
