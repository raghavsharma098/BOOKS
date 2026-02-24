/**
 * Admin Dashboard Controller
 * Aggregates stats across all models for the central admin dashboard.
 * Access: admin | editorial_admin
 */
const User = require('../models/User.model');
const Book = require('../models/Book.model');
const Review = require('../models/Review.model');
const ReviewComment = require('../models/ReviewComment.model');
const Giveaway = require('../models/Giveaway.model');
const BookClub = require('../models/BookClub.model');
const BlogPost = require('../models/BlogPost.model');
const Notification = require('../models/Notification.model');

// ─── Helper ─────────────────────────────────────────────────────────────────
const safeCount = (Model, query = {}) =>
  Model.countDocuments(query).catch(() => 0);

// @desc    Admin dashboard overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      totalBooks,
      totalReviews,
      reportedReviews,
      hiddenReviews,
      pendingClubs,
      featuredClubs,
      activeGiveaways,
      pendingGiveaways,
      totalBlogs,
      publishedBlogs,
      featuredBlogs,
      draftBlogs,
      totalNotifications,
    ] = await Promise.all([
      safeCount(User, { isActive: { $ne: false } }),
      safeCount(User, { createdAt: { $gte: weekAgo } }),
      safeCount(Book),
      safeCount(Review, { isDeleted: { $ne: true } }),
      safeCount(Review, { 'reports.0': { $exists: true }, isHidden: { $ne: true }, isDeleted: { $ne: true } }),
      safeCount(Review, { isHidden: true, isDeleted: { $ne: true } }),
      safeCount(BookClub, { status: 'pending' }),
      safeCount(BookClub, { clubType: 'editorial_pick', isDeleted: { $ne: true } }),
      safeCount(Giveaway, { status: 'active', endDate: { $gt: now } }),
      safeCount(Giveaway, { status: 'pending' }),
      safeCount(BlogPost, { isDeleted: { $ne: true } }),
      safeCount(BlogPost, { visibility: 'published', isDeleted: { $ne: true } }),
      safeCount(BlogPost, { visibility: 'featured', isDeleted: { $ne: true } }),
      safeCount(BlogPost, { visibility: 'draft', isDeleted: { $ne: true } }),
      safeCount(Notification),
    ]);

    // Recent moderation items
    const recentReported = await Review.find({
      'reports.0': { $exists: true },
      isDeleted: { $ne: true },
    })
      .sort({ 'reports.length': -1, updatedAt: -1 })
      .limit(5)
      .populate('user', 'name username profilePicture')
      .populate('book', 'title');

    // Popular books this week (by weeklyViews) — only books with uploaded covers
    const popularBooks = await Book.find({ coverImage: { $regex: /^\/uploads\// } })
      .sort({ weeklyViews: -1 })
      .limit(5)
      .select('title coverImage weeklyViews views averageRating author')
      .populate('author', 'name');

    // Recent blog performance
    const recentBlogs = await BlogPost.find({ isDeleted: { $ne: true }, visibility: { $ne: 'draft' } })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title type visibility views publishedAt')
      .populate('author', 'name');

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, newThisWeek: newUsersThisWeek },
        books: { total: totalBooks },
        moderation: {
          pendingReports: reportedReviews,
          hiddenReviews,
          pendingClubs,
        },
        giveaways: { active: activeGiveaways, pending: pendingGiveaways },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          featured: featuredBlogs,
          draft: draftBlogs,
        },
        community: { featuredClubs },
        notifications: { total: totalNotifications },
        recentReported,
        popularBooks,
        recentBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -passwordResetToken -emailVerificationToken')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role / suspend (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, isSuspended, suspendedReason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent self-demotion
    if (req.user._id.toString() === user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote yourself' });
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isSuspended === 'boolean') {
      user.isSuspended = isSuspended;
      user.suspendedReason = isSuspended ? suspendedReason || 'Admin action' : null;
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
