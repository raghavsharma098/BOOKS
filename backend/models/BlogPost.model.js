const mongoose = require('mongoose');

/**
 * BlogPost model
 * Used by admin / editorial_admin to create CMS-style editorial content.
 * Types: editorial_review | book_of_week | reading_guide | author_spotlight | announcement
 * Visibility: draft | published | featured
 */
const blogPostSchema = new mongoose.Schema(
  {
    // ─── Core Content ─────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Rich-text HTML stored as string (sanitised before save in controller)
    body: {
      type: String,
      required: [true, 'Body content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    coverImage: {
      type: String, // Cloudinary URL
    },

    // ─── Classification ───────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        'editorial_review',
        'book_of_week',
        'reading_guide',
        'author_spotlight',
        'announcement',
      ],
      required: [true, 'Post type is required'],
      default: 'editorial_review',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ─── Visibility & Status ──────────────────────────────────────────
    visibility: {
      type: String,
      enum: ['draft', 'published', 'featured'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },

    // ─── Relations ────────────────────────────────────────────────────
    // Linked book (for editorial reviews, book-of-week, etc.)
    relatedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
    // Linked author (for author spotlights)
    relatedAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
    },

    // ─── Authorship ───────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Engagement (read-only counters) ──────────────────────────────
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // estimated minutes

    // ─── Soft Delete ──────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
blogPostSchema.index({ visibility: 1, publishedAt: -1 });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ relatedBook: 1 });
blogPostSchema.index({ type: 1 });

// ─── Auto-generate slug from title ──────────────────────────────────────────
blogPostSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') +
      '-' +
      Date.now();
  }
  // Auto-set publishedAt when going live for first time
  if (
    this.isModified('visibility') &&
    (this.visibility === 'published' || this.visibility === 'featured') &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
