const Review = require('../models/Review.model');
const ReviewComment = require('../models/ReviewComment.model');
const Book = require('../models/Book.model');
const User = require('../models/User.model');
const activityHelper = require('../utils/activityHelper');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get book reviews
// @route   GET /api/reviews/book/:bookId
// @access  Public
exports.getBookReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { book: req.params.bookId };

    const sortBy = req.query.sortBy || 'recent';
    const sortOptions = sortBy === 'helpful' ? { likeCount: -1 } : { createdAt: -1 };

    const reviews = await Review.find(query)
      .populate('user', 'name username profilePicture stats')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { bookId, rating, emotionalReaction, structuredReview, reviewText, containsSpoilers, pace, plotDriven, loveableCharacters, diverseCast, flawsFocus } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: req.user._id, book: bookId });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book. Please update your existing review.',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating,
      emotionalReaction,
      structuredReview,
      reviewText,
      containsSpoilers,
      ...(pace && { pace }),
      ...(plotDriven && { plotDriven }),
      ...(loveableCharacters && { loveableCharacters }),
      ...(diverseCast && { diverseCast }),
      ...(flawsFocus && { flawsFocus }),
    });

    // Update book rating
    const book = await Book.findById(bookId);
    book.updateRating(rating);
    book.totalReviews += 1;
    book.ratingDistribution[Math.floor(rating)] += 1;
    await book.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.totalReviews += 1;
    await user.save();

    // Log activity
    await activityHelper.logReviewCreated(req.user._id, bookId, review._id, book.title);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findOne({ _id: req.params.id, user: req.user._id });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const oldRating = review.rating;
    const allowedUpdates = ['rating', 'emotionalReaction', 'structuredReview', 'reviewText', 'containsSpoilers'];
    
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        review[key] = req.body[key];
      }
    });

    await review.save();

    // Update book rating if rating changed
    if (req.body.rating && req.body.rating !== oldRating) {
      const book = await Book.findById(review.book);
      book.updateRating(req.body.rating, oldRating);
      book.ratingDistribution[Math.floor(oldRating)] -= 1;
      book.ratingDistribution[Math.floor(req.body.rating)] += 1;
      await book.save();
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isDeleted = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike review
// @route   POST /api/reviews/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const isLiked = review.likes.includes(req.user._id);

    if (isLiked) {
      review.removeLike(req.user._id);
    } else {
      review.addLike(req.user._id);
      
      // Notify review author
      if (review.user.toString() !== req.user._id.toString()) {
        await notificationHelper.createNotification({
          user: review.user,
          type: 'review_like',
          title: 'Review Liked',
          message: `${req.user.name} liked your review`,
          relatedReview: review._id,
          relatedUser: req.user._id,
          actionUrl: `/reviews/${review._id}`,
          sendEmail: true,
        });
      }
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: { liked: !isLiked, likeCount: review.likeCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to review
// @route   POST /api/reviews/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { commentText } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const comment = await ReviewComment.create({
      review: review._id,
      user: req.user._id,
      commentText,
    });

    review.commentCount += 1;
    await review.save();

    // Notify review author
    if (review.user.toString() !== req.user._id.toString()) {
      await notificationHelper.createNotification({
        user: review.user,
        type: 'review_comment',
        title: 'New Comment',
        message: `${req.user.name} commented on your review`,
        relatedReview: review._id,
        relatedUser: req.user._id,
        actionUrl: `/reviews/${review._id}`,
        sendEmail: true,
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.addReport(req.user._id, reason);
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully',
    });
  } catch (error) {
    next(error);
  }
};
