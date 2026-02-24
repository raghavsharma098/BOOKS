const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const AuditLog = require('../models/AuditLog.model');
const { uploadToCloudinary } = require('../utils/imageUpload');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Find or create an author by name.
 * Used for both user submissions and admin created books.
 */
async function findOrCreateAuthor(authorName, createdByRole = 'system') {
  if (!authorName || !authorName.trim()) return null;
  const existing = await Author.findOne({ name: new RegExp(`^${authorName.trim()}$`, 'i') });
  if (existing) return existing;
  return await Author.create({
    name: authorName.trim(),
    createdBy: createdByRole === 'admin' ? 'admin' : 'system',
  });
}

/** Log an admin action to the AuditLog collection */
async function log(adminId, action, targetId, targetModel = 'Book', extras = {}) {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetModel,
      targetId,
      ...extras,
    });
  } catch (_) {
    // Non-fatal – never break the main flow
  }
}

// ─── USER: Submit a book (restricted fields, status = pending) ────────────────

/**
 * @desc   User submits a new book for admin review
 * @route  POST /api/books/submit
 * @access Private (any authenticated user)
 */
exports.submitBook = async (req, res, next) => {
  try {
    const { title, authorName, isbn, language, coverUrl, submissionNote } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!authorName || !authorName.trim()) {
      return res.status(400).json({ success: false, message: 'Author name is required' });
    }

    // Duplicate check by ISBN (if provided)
    if (isbn) {
      const duplicate = await Book.findOne({ isbn: isbn.trim() }).setOptions({ includeDeleted: true });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'A book with this ISBN already exists',
          existingId: duplicate._id,
        });
      }
    }

    // Loose duplicate check — same title + same author name (case-insensitive)
    const authorDoc = await Author.findOne({ name: new RegExp(`^${authorName.trim()}$`, 'i') });
    if (authorDoc) {
      const looseDup = await Book.findOne({
        title: new RegExp(`^${title.trim()}$`, 'i'),
        author: authorDoc._id,
      }).setOptions({ includeDeleted: true });
      if (looseDup) {
        return res.status(409).json({
          success: false,
          message: 'This book may already exist. Please check search before adding.',
          existingId: looseDup._id,
        });
      }
    }

    // Handle cover image upload
    let coverImage = coverUrl || undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      coverImage = result.url;
    }

    // Find or create author (status: unverified, created by system)
    const author = await findOrCreateAuthor(authorName, 'system');

    const book = await Book.create({
      title: title.trim(),
      author: author._id,
      isbn: isbn ? isbn.trim() : undefined,
      language: language || 'English',
      coverImage,
      submissionNote: submissionNote ? submissionNote.trim() : undefined,
      status: 'pending',        // Always pending for user submissions
      createdBy: req.user._id,
      createdByType: 'user',
      description: '',
      genres: [],
    });

    res.status(201).json({
      success: true,
      message: 'Book submitted for review. It will appear publicly once approved.',
      data: { _id: book._id, title: book.title, status: book.status },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Get all books with optional filters ───────────────────────────────

/**
 * @desc   Admin list of all books with status/search filters
 * @route  GET /api/admin/books
 * @access Admin | editorial_admin
 */
exports.getAllBooksAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.search) query.title = { $regex: req.query.search.trim(), $options: 'i' };
    if (req.query.createdByType) query.createdByType = req.query.createdByType;

    const books = await Book.find(query)
      .setOptions({ includeDeleted: false })
      .populate('author', 'name profilePhoto isVerified')
      .populate('createdBy', 'name username email')
      .populate('approvedBy', 'name username')
      .populate('rejectedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);
    const pendingCount = await Book.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      total,
      pendingCount,
      page,
      pages: Math.ceil(total / limit),
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Get single book detail ───────────────────────────────────────────

/**
 * @desc   Admin view single book (all statuses)
 * @route  GET /api/admin/books/:id
 * @access Admin | editorial_admin
 */
exports.getAdminBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author')
      .populate('createdBy', 'name username email profileImage')
      .populate('approvedBy', 'name username')
      .populate('rejectedBy', 'name username');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Also fetch last 5 audit log entries for this book
    const audit = await AuditLog.find({ targetId: book._id })
      .populate('admin', 'name username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, data: book, audit });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Approve a pending book ───────────────────────────────────────────

/**
 * @desc   Approve a user-submitted book. Optionally enrich metadata beforehand.
 * @route  POST /api/admin/books/:id/approve
 * @access Admin | editorial_admin
 */
exports.approveBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    if (book.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Book is already approved' });
    }

    const before = { status: book.status };

    // Admin may patch metadata at approval time
    const allowed = [
      'title', 'description', 'genres', 'moodTags', 'contentWarnings',
      'pageCount', 'publicationDate', 'publisher', 'language',
      'readingPace', 'editorialBadge', 'subtitle',
      'format', 'editors', 'buyLink',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) book[field] = req.body[field];
    });

    // Optional cover upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      book.coverImage = result.url;
    }

    // Handle author enrichment / name override
    if (req.body.authorName && req.body.authorName !== book.author?.name) {
      const author = await findOrCreateAuthor(req.body.authorName, 'admin');
      book.author = author._id;
    }

    book.status = 'approved';
    book.approvedBy = req.user._id;
    book.approvedAt = new Date();
    book.rejectionReason = undefined;
    await book.save();

    // Increment author totalBooks if author exists
    await Author.findByIdAndUpdate(book.author, { $inc: { totalBooks: 1 } });

    await log(req.user._id, 'book_approved', book._id, 'Book', {
      before,
      after: { status: 'approved' },
      reason: req.body.note,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Book approved and now publicly visible.',
      data: { _id: book._id, title: book.title, status: book.status },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Reject a pending book ────────────────────────────────────────────

/**
 * @desc   Reject a user-submitted book with a reason
 * @route  POST /api/admin/books/:id/reject
 * @access Admin | editorial_admin
 */
exports.rejectBook = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot reject an already-approved book' });
    }

    const before = { status: book.status };

    book.status = 'rejected';
    book.rejectionReason = reason || 'Rejected by admin';
    book.rejectedBy = req.user._id;
    book.rejectedAt = new Date();
    await book.save();

    await log(req.user._id, 'book_rejected', book._id, 'Book', {
      before,
      after: { status: 'rejected', rejectionReason: book.rejectionReason },
      reason,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Book rejected.',
      data: { _id: book._id, title: book.title, status: book.status, rejectionReason: book.rejectionReason },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Edit a book (any status) ─────────────────────────────────────────

/**
 * @desc   Admin edits any field on a book (incl. pre-approval enrichment)
 * @route  PUT /api/admin/books/:id
 * @access Admin | editorial_admin
 */
exports.adminUpdateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });

    const before = { ...book.toObject() };

    // Handle cover upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      req.body.coverImage = result.url;
    }

    // Handle author name change
    if (req.body.authorName) {
      const author = await findOrCreateAuthor(req.body.authorName, 'admin');
      req.body.author = author._id;
      delete req.body.authorName;
    }

    // Prevent status changes via this route — use approve/reject
    delete req.body.status;
    delete req.body.createdBy;
    delete req.body.createdByType;

    Object.assign(book, req.body);
    await book.save();

    await log(req.user._id, 'book_edited_before_approval', book._id, 'Book', {
      before: { title: before.title, status: before.status },
      after: { title: book.title, status: book.status },
      ip: req.ip,
    });

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Create book directly (full metadata, goes live immediately) ───────

/**
 * @desc   Admin creates a book with full metadata — status = approved immediately
 * @route  POST /api/admin/books
 * @access Admin | editorial_admin
 */
exports.adminCreateBook = async (req, res, next) => {
  try {
    const {
      title, authorName, authorId,
      description, isbn, language, pageCount,
      publicationDate, publisher, genres, moodTags,
      contentWarnings, readingPace, editorialBadge, subtitle,
      coverUrl,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // ISBN uniqueness check
    if (isbn) {
      const dup = await Book.findOne({ isbn: isbn.trim() }).setOptions({ includeDeleted: true });
      if (dup) {
        return res.status(409).json({ success: false, message: 'A book with this ISBN already exists', existingId: dup._id });
      }
    }

    // Resolve author
    let author;
    if (authorId) {
      author = await Author.findById(authorId);
      if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
    } else if (authorName) {
      author = await findOrCreateAuthor(authorName, 'admin');
    } else {
      return res.status(400).json({ success: false, message: 'Author name or ID is required' });
    }

    // Cover image
    let coverImage = coverUrl || undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      coverImage = result.url;
    }

    const book = await Book.create({
      title: title.trim(),
      subtitle,
      author: author._id,
      description: description || '',
      isbn: isbn ? isbn.trim() : undefined,
      language: language || 'English',
      pageCount: pageCount ? Number(pageCount) : undefined,
      publicationDate: publicationDate || undefined,
      publisher: publisher || undefined,
      genres: Array.isArray(genres) ? genres : (genres ? [genres] : []),
      moodTags: Array.isArray(moodTags) ? moodTags : (moodTags ? [moodTags] : []),
      contentWarnings: Array.isArray(contentWarnings) ? contentWarnings : (contentWarnings ? [contentWarnings] : []),
      readingPace: readingPace || 'medium',
      editorialBadge: editorialBadge || null,
      coverImage,
      status: 'approved',        // Admin books go live immediately
      createdBy: req.user._id,
      createdByType: 'admin',
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // Update author stats
    await Author.findByIdAndUpdate(author._id, { $inc: { totalBooks: 1 } });

    await log(req.user._id, 'book_created_by_admin', book._id, 'Book', {
      after: { title: book.title, status: book.status },
      ip: req.ip,
    });

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// ─── USER: Get own submitted books ───────────────────────────────────────────

/**
 * @desc   User views their own submitted books (all statuses)
 * @route  GET /api/books/my-submissions
 * @access Private
 */
exports.getMySubmissions = async (req, res, next) => {
  try {
    const books = await Book.find({
      createdBy: req.user._id,
      createdByType: 'user',
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
};
