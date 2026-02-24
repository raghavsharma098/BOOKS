const Activity = require('../models/Activity.model');
const User = require('../models/User.model');
const activityHelper = require('../utils/activityHelper');

// @desc    Get activity feed
// @route   GET /api/community/feed
// @access  Private
exports.getActivityFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(req.user._id);
    const followingIds = user.following;

    const activities = await activityHelper.getActivityFeed(
      req.user._id,
      followingIds,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      count: activities.length,
      page,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's activity
// @route   GET /api/community/activity/:userId
// @access  Public
exports.getUserActivity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({
      user: req.params.userId,
      isPrivate: false,
    })
      .populate('user', 'name username profilePicture')
      .populate('relatedBook', 'title coverImage')
      .populate('relatedUser', 'name username profilePicture')
      .populate('relatedClub', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({
      user: req.params.userId,
      isPrivate: false,
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like activity
// @route   POST /api/community/activity/:id/like
// @access  Private
exports.likeActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const isLiked = activity.likes.includes(req.user._id);

    if (isLiked) {
      activity.likes = activity.likes.filter(id => id.toString() !== req.user._id.toString());
      activity.likeCount -= 1;
    } else {
      activity.likes.push(req.user._id);
      activity.likeCount += 1;
    }

    await activity.save();

    res.status(200).json({
      success: true,
      data: { liked: !isLiked, likeCount: activity.likeCount },
    });
  } catch (error) {
    next(error);
  }
};
