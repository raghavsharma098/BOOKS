const Reading = require('../models/Reading.model');
const Book = require('../models/Book.model');
const User = require('../models/User.model');
const activityHelper = require('../utils/activityHelper');

// @desc    Get user's reading list
// @route   GET /api/reading
// @access  Private
exports.getMyReadingList = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const readings = await Reading.find(query)
      .populate({
        path: 'book',
        select: 'title coverImage author pageCount averageRating totalRatings format publicationDate',
        populate: { path: 'author', select: 'name profilePhoto isVerified status claimedBy', populate: { path: 'claimedBy', select: 'profilePicture' } },
      })
      .sort('-updatedAt');

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add book to reading list
// @route   POST /api/reading
// @access  Private
exports.addToReadingList = async (req, res, next) => {
  try {
    const { bookId, status } = req.body;

    // Check if already exists
    let reading = await Reading.findOne({ user: req.user._id, book: bookId });

    if (reading) {
      reading.status = status;
      await reading.save();
    } else {
      reading = await Reading.create({
        user: req.user._id,
        book: bookId,
        status,
        startDate: status === 'currently_reading' ? Date.now() : undefined,
      });
    }

    // Update book counts
    const book = await Book.findById(bookId);
    if (status === 'want_to_read') {
      book.wantToReadCount += 1;
      await activityHelper.logAddedToTBR(req.user._id, bookId, book.title);
    } else if (status === 'currently_reading') {
      book.currentlyReadingCount += 1;
      reading.startDate = Date.now();
      await activityHelper.logBookStarted(req.user._id, bookId, book.title);
    }
    await book.save();

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reading progress
// @route   PUT /api/reading/:id/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
  try {
    const pagesRead = Number(req.body.pagesRead) || 0;
    const timeSpent = Number(req.body.timeSpent) || 0;
    const { mood, notes } = req.body;

    const reading = await Reading.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('book');

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading record not found',
      });
    }

    reading.addSession(pagesRead, timeSpent, mood, notes);
    await reading.save();

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark book as finished
// @route   PUT /api/reading/:id/finish
// @access  Private
exports.markAsFinished = async (req, res, next) => {
  try {
    const reading = await Reading.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('book');

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading record not found',
      });
    }

    reading.markAsFinished();
    await reading.save();

    // Update stats
    const user = await User.findById(req.user._id);
    user.stats.totalBooksRead += 1;
    user.readingGoals.completedThisYear += 1;
    await user.save();

    // Update book count
    const book = await Book.findById(reading.book._id);
    book.finishedCount += 1;
    book.currentlyReadingCount = Math.max(0, book.currentlyReadingCount - 1);
    await book.save();

    // Log activity
    await activityHelper.logBookFinished(req.user._id, reading.book._id, reading.book.title);

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark book as DNF
// @route   PUT /api/reading/:id/dnf
// @access  Private
exports.markAsDNF = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const reading = await Reading.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading record not found',
      });
    }

    reading.markAsDNF(reason);
    await reading.save();

    // Update book count
    const book = await Book.findById(reading.book);
    book.currentlyReadingCount = Math.max(0, book.currentlyReadingCount - 1);
    await book.save();

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reading record
// @route   DELETE /api/reading/:id
// @access  Private
exports.deleteReading = async (req, res, next) => {
  try {
    const reading = await Reading.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Reading record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reading record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
