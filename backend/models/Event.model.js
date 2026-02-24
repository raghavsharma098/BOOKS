const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  coverImage: {
    type: String,
  },
  
  // Event Type
  type: {
    type: String,
    enum: [
      // Title-case (used by admin panel)
      'Author Talk', 'Book Club', 'Workshop', 'Festival', 'Launch', 'Reading', 'Panel', 'Signing', 'Meetup', 'Other',
      // Lowercase (legacy / user-created events)
      'meetup', 'launch', 'festival', 'signing', 'workshop', 'other',
    ],
    required: true,
  },
  
  // Location & Time
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  venue: {
    type: String,
  },
  address: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  
  // Organizer
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByType: {
    type: String,
    enum: ['admin', 'verified_author'],
    required: true,
  },
  
  // Related Content
  relatedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  },
  relatedAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  
  // RSVPs
  rsvps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rsvpedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'cancelled'],
      default: 'going',
    },
  }],
  rsvpCount: {
    type: Number,
    default: 0,
  },
  maxAttendees: {
    type: Number,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  rejectionReason: String,
  
  // Flags
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // External booking / ticket URL
  bookingLink: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
eventSchema.index({ city: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ isDeleted: 1 });

// Text search
eventSchema.index({ title: 'text', description: 'text', city: 'text' });

// Method to add RSVP
eventSchema.methods.addRSVP = function(userId, status = 'going') {
  const existingRSVP = this.rsvps.find(r => r.user.toString() === userId.toString());
  
  if (!existingRSVP) {
    this.rsvps.push({ user: userId, status });
    this.rsvpCount += 1;
  } else {
    existingRSVP.status = status;
  }
};

// Method to remove RSVP
eventSchema.methods.removeRSVP = function(userId) {
  const index = this.rsvps.findIndex(r => r.user.toString() === userId.toString());
  
  if (index > -1) {
    this.rsvps.splice(index, 1);
    this.rsvpCount -= 1;
  }
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
