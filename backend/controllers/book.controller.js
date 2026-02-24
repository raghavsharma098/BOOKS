const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const { uploadToCloudinary } = require('../utils/imageUpload');

// @desc    Get all books with filters
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'approved' };

    if (req.query.genre) {
      query.genres = { $in: Array.isArray(req.query.genre) ? req.query.genre : [req.query.genre] };
    }
    if (req.query.mood) {
      query.moodTags = { $in: Array.isArray(req.query.mood) ? req.query.mood : [req.query.mood] };
    }
    if (req.query.pace) {
      query.readingPace = req.query.pace;
    }
    if (req.query.language) {
      query.language = req.query.language;
    }
    if (req.query.minRating) {
      query.averageRating = { $gte: parseFloat(req.query.minRating) };
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sort
    const sortOptions = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sortOptions[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const books = await Book.find(query)
      .populate('author', 'name profilePhoto isVerified')
      .populate('createdBy', 'name username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('author')
      .populate('createdBy', 'name username');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Increment total views
    book.views += 1;

    // Increment weekly views, auto-reset if 7 days have passed
    const now = new Date();
    const lastReset = book.weeklyViewsLastReset || new Date(0);
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    if (now - lastReset >= msInWeek) {
      book.weeklyViews = 1;
      book.weeklyViewsLastReset = now;
    } else {
      book.weeklyViews += 1;
    }

    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular books (most viewed / clicked)
// @route   GET /api/books/popular
// @access  Public
exports.getPopularBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const books = await Book.find({ status: 'approved' })
      .populate('author', 'name profilePhoto isVerified')
      .sort({ views: -1, averageRating: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending books this week (most weekly views)
// @route   GET /api/books/trending
// @access  Public
exports.getTrendingBooksWeekly = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Sort by weeklyViews first, then fall back to overall views + engagement
    const books = await Book.find({ status: 'approved' })
      .populate('author', 'name profilePhoto isVerified')
      .sort({ weeklyViews: -1, views: -1, currentlyReadingCount: -1, averageRating: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create book
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res, next) => {
  try {
    const { authorId, authorName, ...bookData } = req.body;

    let author;
    if (authorId) {
      author = await Author.findById(authorId);
      if (!author) {
        return res.status(404).json({
          success: false,
          message: 'Author not found',
        });
      }
    } else if (authorName) {
      // Create author if doesn't exist
      author = await Author.findOne({ name: authorName });
      if (!author) {
        author = await Author.create({
          name: authorName,
          createdBy: req.user.role === 'admin' ? 'admin' : 'user',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Author is required',
      });
    }

    // Handle cover image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      bookData.coverImage = result.url;
    }

    const book = await Book.create({
      ...bookData,
      author: author._id,
      createdBy: req.user._id,
      createdByType: req.user.role === 'admin' ? 'admin' : 'user',
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    // Update author stats
    author.totalBooks += 1;
    await author.save();

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check ownership
    if (
      book.createdBy.toString() !== req.user._id.toString() &&
      !['admin', 'editorial_admin'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this book',
      });
    }

    // Handle cover image
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'book-covers');
      req.body.coverImage = result.url;
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book (soft)
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check ownership
    if (
      book.createdBy.toString() !== req.user._id.toString() &&
      !['admin', 'editorial_admin'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this book',
      });
    }

    book.isDeleted = true;
    book.deletedAt = Date.now();
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject book (Admin)
// @route   PUT /api/books/:id/status
// @access  Private/Admin
exports.updateBookStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    book.status = status;
    if (status === 'rejected' && rejectionReason) {
      book.rejectionReason = rejectionReason;
    }

    await book.save();

    // When a book is approved, mark its auto-created author as unclaimed so they can be claimed
    if (status === 'approved' && book.author) {
      const Author = require('../models/Author.model');
      await Author.updateOne(
        { _id: book.author, status: 'auto_created' },
        { $set: { status: 'unclaimed' } }
      );
    }

    // Send notification
    const notificationHelper = require('../utils/notificationHelper');
    await notificationHelper.createNotification({
      user: book.createdBy,
      type: status === 'approved' ? 'book_approved' : 'book_rejected',
      title: `Book ${status}`,
      message: `Your book "${book.title}" has been ${status}`,
      relatedBook: book._id,
      actionUrl: `/books/${book._id}`,
      sendEmail: true,
    });

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set editorial badge (Admin)
// @route   PUT /api/books/:id/editorial-badge
// @access  Private/Admin
exports.setEditorialBadge = async (req, res, next) => {
  try {
    const { badgeType } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { editorialBadge: badgeType },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get other books by same author, publisher, or editors
// @route   GET /api/books/:id/editions
// @access  Public
exports.getBookEditions = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('author publisher editors');

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const limit = parseInt(req.query.limit) || 6;
    const orConditions = [];

    if (book.author) orConditions.push({ author: book.author });
    if (book.publisher) orConditions.push({ publisher: new RegExp(`^${book.publisher.trim()}$`, 'i') });
    if (book.editors && book.editors.length > 0) {
      orConditions.push({ editors: { $in: book.editors } });
    }

    if (orConditions.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const editions = await Book.find({
      _id: { $ne: book._id },
      status: 'approved',
      $or: orConditions,
    })
      .populate('author', 'name profilePhoto isVerified')
      .sort({ averageRating: -1, publicationDate: -1 })
      .limit(limit);

    res.status(200).json({ success: true, count: editions.length, data: editions });
  } catch (error) {
    next(error);
  }
};
