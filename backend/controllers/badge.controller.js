const Badge = require('../models/Badge.model');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
exports.getBadges = async (req, res, next) => {
  try {
    const query = { isActive: true };

    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    if (req.query.targetBook) {
      query.targetBook = req.query.targetBook;
    }
    if (req.query.targetUser) {
      query.targetUser = req.query.targetUser;
    }

    const badges = await Badge.find(query)
      .populate('targetBook', 'title coverImage')
      .populate('targetUser', 'name username profilePicture')
      .populate('assignedBy', 'name username')
      .sort('-assignedAt');

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign badge (Admin)
// @route   POST /api/badges
// @access  Private/Admin
exports.assignBadge = async (req, res, next) => {
  try {
    const badge = await Badge.create({
      ...req.body,
      assignedBy: req.user._id,
    });

    // Send notification
    if (badge.targetUser) {
      await notificationHelper.createNotification({
        user: badge.targetUser,
        type: 'badge_assigned',
        title: 'New Badge!',
        message: `You've received the "${badge.name}" badge!`,
        actionUrl: `/profile`,
        sendEmail: true,
      });
    }

    res.status(201).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove badge (Admin)
// @route   DELETE /api/badges/:id
// @access  Private/Admin
exports.removeBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found',
      });
    }

    badge.isActive = false;
    badge.isDeleted = true;
    await badge.save();

    res.status(200).json({
      success: true,
      message: 'Badge removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
