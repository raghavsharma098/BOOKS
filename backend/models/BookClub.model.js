const mongoose = require('mongoose');

const bookClubSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  coverImage: {
    type: String,
  },
  clubLogo: {
    type: String,
  },
  
  // Creator & Admins
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Privacy
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  
  // Club Type
  clubType: {
    type: String,
    enum: ['emotional', 'genre', 'buddy_read', 'author_led', 'editorial_pick'],
    required: true,
  },
  genreFocus: {
    type: String,
  },

  // Admin-assigned quality markers
  isFeatured:  { type: Boolean, default: false },  // shown on discovery / homepage
  isEditorial: { type: Boolean, default: false },  // editorial-pick badge
  isVerified:  { type: Boolean, default: false },  // verified community badge

  // Discussion structure (set by creator or admin)
  discussionStructure: {
    type: String,
    enum: ['chapter_wise', 'open'],
    default: 'open',
  },

  // Optional capacity
  maxMembers: {
    type: Number,
    min: [2, 'Max members must be at least 2'],
  },

  // Tags for discovery
  tags: [{ type: String, trim: true }],
  selectedBooks: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    isCurrentRead: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    // Reading progress (page count in current club book)
    currentPage: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  }],
  memberCount: {
    type: Number,
    default: 0,
  },
  
  // Books the club has finished reading
  completedBooks: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    finishedAt: { type: Date, default: Date.now },
    rating: { type: Number, min: 0, max: 5 },
  }],

  // Join Requests (for private clubs)
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    message: String,
  }],
  
  // Status (admin-controlled)
  // draft:     admin only, not yet submitted
  // pending:   user / author created — awaits review
  // approved:  public, visible to everyone
  // rejected:  never public
  // suspended: admin disabled an approved club
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  rejectionReason: { type: String },
  suspendReason:   { type: String },

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
bookClubSchema.index({ creator: 1 });
bookClubSchema.index({ privacy: 1 });
bookClubSchema.index({ clubType: 1 });
bookClubSchema.index({ isDeleted: 1, isActive: 1 });
bookClubSchema.index({ 'members.user': 1 });

// Text search
bookClubSchema.index({ name: 'text', description: 'text' });

// Method to add member
bookClubSchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  
  if (!existingMember) {
    this.members.push({ user: userId, role });
    this.memberCount += 1;
  }
};

// Method to remove member
bookClubSchema.methods.removeMember = function(userId) {
  const index = this.members.findIndex(m => m.user.toString() === userId.toString());
  
  if (index > -1) {
    this.members.splice(index, 1);
    this.memberCount -= 1;
  }
};

// Method to add book
bookClubSchema.methods.addBook = function(bookId) {
  const existingBook = this.selectedBooks.find(b => b.book.toString() === bookId.toString());
  
  if (!existingBook) {
    this.selectedBooks.push({ book: bookId });
  }
};

const BookClub = mongoose.model('BookClub', bookClubSchema);

module.exports = BookClub;
