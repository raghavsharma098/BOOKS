/**
 * Moderation Controller
 * Admin-only. Manages reviews, comments, and book clubs.
 * Philosophy: reader-first, not social media — strict content rules.
 */
const Review = require('../models/Review.model');
const ReviewComment = require('../models/ReviewComment.model');
const BookClub = require('../models/BookClub.model');
const User = require('../models/User.model');
const notificationHelper = require('../utils/notificationHelper');

// ═══════════════════════════════════════════════════════════════════
// REVIEW MODERATION
// ═══════════════════════════════════════════════════════════════════

// @desc    Get all reviews (with moderation filters)
// @route   GET /api/admin/moderation/reviews
// @access  Private/Admin
exports.getReviewsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };

    // Filter: reported only
    if (req.query.reported === 'true') {
      filter['reports.0'] = { $exists: true };
    }
    // Filter: hidden
    if (req.query.hidden === 'true') filter.isHidden = true;
    // Filter: low rating (1 or 2 stars)
    if (req.query.lowRating === 'true') filter.rating = { $lte: 2 };
    // Filter: flagged keywords
    if (req.query.keyword) {
      filter.reviewText = { $regex: req.query.keyword, $options: 'i' };
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ 'reports.length': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name username profilePicture email')
        .populate('book', 'title coverImage'),
      Review.countDocuments(filter),
    ]);

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

// @desc    Hide a review
// @route   PATCH /api/admin/moderation/reviews/:id/hide
// @access  Private/Admin
exports.hideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isHidden: true },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.status(200).json({ success: true, message: 'Review hidden', data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Unhide a review
// @route   PATCH /api/admin/moderation/reviews/:id/unhide
// @access  Private/Admin
exports.unhideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isHidden: false },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.status(200).json({ success: true, message: 'Review unhidden', data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Hard-delete a review (admin only)
// @route   DELETE /api/admin/moderation/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.isDeleted = true;
    review.isHidden = true;
    await review.save();

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all reports on a review (dismiss reports)
// @route   PATCH /api/admin/moderation/reviews/:id/dismiss-reports
// @access  Private/Admin
exports.dismissReviewReports = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { reports: [] } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.status(200).json({ success: true, message: 'Reports cleared', data: review });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// COMMENT MODERATION
// ═══════════════════════════════════════════════════════════════════

// @desc    Get comments (with optional filters)
// @route   GET /api/admin/moderation/comments
// @access  Private/Admin
exports.getCommentsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };
    if (req.query.reported === 'true') filter['reports.0'] = { $exists: true };
    if (req.query.hidden === 'true') filter.isHidden = true;

    const [comments, total] = await Promise.all([
      ReviewComment.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'name username profilePicture')
        .populate('review', 'reviewText book'),
      ReviewComment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true, count: comments.length, total, page,
      pages: Math.ceil(total / limit), data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hide / delete comment
// @route   PATCH /api/admin/moderation/comments/:id/hide
// @route   DELETE /api/admin/moderation/comments/:id
// @access  Private/Admin
exports.hideComment = async (req, res, next) => {
  try {
    const comment = await ReviewComment.findByIdAndUpdate(
      req.params.id,
      { isHidden: true },
      { new: true }
    );
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    res.status(200).json({ success: true, message: 'Comment hidden', data: comment });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await ReviewComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.isDeleted = true;
    comment.isHidden = true;
    await comment.save();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// USER MODERATION
// ═══════════════════════════════════════════════════════════════════

// @desc    Warn a user (creates internal warning record)
// @route   POST /api/admin/moderation/users/:id/warn
// @access  Private/Admin
exports.warnUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Store warning in user record
    if (!user.warnings) user.warnings = [];
    user.warnings.push({ reason, warnedBy: req.user._id, warnedAt: new Date() });
    await user.save();

    // Send notification
    await notificationHelper.createNotification({
      recipient: user._id,
      type: 'system',
      title: 'Account Warning',
      message: reason || 'Your account has received a warning from a moderator.',
    }).catch(() => {}); // non-critical

    res.status(200).json({ success: true, message: 'Warning issued', warningCount: user.warnings.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend a user
// @route   POST /api/admin/moderation/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res, next) => {
  try {
    const { reason, duration } = req.body; // duration in days (0 = indefinite)

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isSuspended = true;
    user.suspendedReason = reason || 'Violation of community guidelines';
    user.suspendedUntil = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;
    await user.save();

    res.status(200).json({ success: true, message: 'User suspended', data: { isSuspended: true, suspendedUntil: user.suspendedUntil } });
  } catch (error) {
    next(error);
  }
};

// @desc    Lift suspension
// @route   POST /api/admin/moderation/users/:id/unsuspend
// @access  Private/Admin
exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false, suspendedReason: null, suspendedUntil: null },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Suspension lifted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// BOOK CLUB MODERATION
// ═══════════════════════════════════════════════════════════════════

// @desc    Get book clubs with optional status filter
// @route   GET /api/admin/moderation/clubs
// @access  Private/Admin
exports.getClubsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };
    if (req.query.status) filter.status = req.query.status;

    const [clubs, total] = await Promise.all([
      BookClub.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name username profilePicture'),
      BookClub.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true, count: clubs.length, total, page,
      pages: Math.ceil(total / limit), data: clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a book club (pending → approved)
// @route   PATCH /api/admin/moderation/clubs/:id/approve
// @access  Private/Admin
exports.approveClub = async (req, res, next) => {
  try {
    const club = await BookClub.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: undefined },
      { new: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    // Notify creator
    await notificationHelper.createNotification({
      recipient: club.creator,
      type: 'system',
      title: 'Book Club Approved',
      message: `Your book club “${club.name}” has been approved and is now public!`,
      relatedEntity: { entityType: 'club', entityId: club._id },
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club approved', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a book club
// @route   PATCH /api/admin/moderation/clubs/:id/reject
// @access  Private/Admin
exports.rejectClub = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const club = await BookClub.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || 'Does not meet community guidelines' },
      { new: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    await notificationHelper.createNotification({
      recipient: club.creator,
      type: 'system',
      title: 'Book Club Not Approved',
      message: `Your book club "${club.name}" was not approved. Reason: ${reason || 'See guidelines.'}`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club rejected', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark / unmark club as editorial pick (isFeatured toggle)
// @route   PATCH /api/admin/moderation/clubs/:id/feature
// @access  Private/Admin
exports.featureClub = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    club.isFeatured = !club.isFeatured;
    await club.save();

    res.status(200).json({
      success: true,
      message: `Club ${club.isFeatured ? 'featured' : 'unfeatured'}`,
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend an approved club
// @route   PATCH /api/admin/moderation/clubs/:id/suspend
// @access  Private/Admin
exports.suspendClub = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const club = await BookClub.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended', suspendReason: reason || 'Suspended by admin' },
      { new: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    await notificationHelper.createNotification({
      recipient: club.creator,
      type: 'system',
      title: 'Book Club Suspended',
      message: `Your book club “${club.name}” has been suspended. Reason: ${reason || 'See community guidelines.'}`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club suspended', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove (soft-delete) a club
// @route   DELETE /api/admin/moderation/clubs/:id
// @access  Private/Admin
exports.removeClub = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    club.isDeleted = true;
    await club.save();

    res.status(200).json({ success: true, message: 'Club removed' });
  } catch (error) {
    next(error);
  }
};
