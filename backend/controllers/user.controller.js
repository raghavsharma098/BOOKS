const User = require('../models/User.model');
const Review = require('../models/Review.model');
const Reading = require('../models/Reading.model');
const Book = require('../models/Book.model');
const { uploadToCloudinary, deleteFromCloudinary, extractPublicId } = require('../utils/imageUpload');
const { revokeAllUserTokens } = require('../utils/jwt');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    // Include email only when the authenticated user is viewing their own profile
    const isSelf = req.user && req.user._id.toString() === req.params.id.toString();
    const user = await User.findById(req.params.id).select(isSelf ? '' : '-email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check privacy settings
    if (!user.privacySettings.showProfile && req.user?._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name',
      'username',
      'bio',
      'preferredGenres',
      'readingPace',
      'moodPreferences',
      'contentAvoidance',
      'readingGoals',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check username uniqueness if updating
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old image if exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      await deleteFromCloudinary(publicId);
    }

    // Upload new image
    const result = await uploadToCloudinary(req.file.buffer, 'profile-pictures');
    user.profilePicture = result.url;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/users/privacy-settings
// @access  Private
exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.privacySettings) {
      user.privacySettings = {
        ...user.privacySettings,
        ...req.body.privacySettings,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.privacySettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/users/notification-settings
// @access  Private
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.notificationSettings) {
      user.notificationSettings = {
        email: {
          ...user.notificationSettings.email,
          ...req.body.notificationSettings.email,
        },
        inApp: {
          ...user.notificationSettings.inApp,
          ...req.body.notificationSettings.inApp,
        },
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    if (!userToFollow.privacySettings.allowFollowers) {
      return res.status(403).json({
        success: false,
        message: 'This user does not allow followers',
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    // Add to following/followers
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // Create activity and notification
    const activityHelper = require('../utils/activityHelper');
    const notificationHelper = require('../utils/notificationHelper');

    await activityHelper.logUserFollowed(
      currentUser._id,
      userToFollow._id,
      userToFollow.username || userToFollow.name
    );

    await notificationHelper.createNotification({
      user: userToFollow._id,
      type: 'follow',
      title: 'New Follower',
      message: `${currentUser.name} started following you`,
      relatedUser: currentUser._id,
      actionUrl: `/users/${currentUser._id}`,
      sendEmail: true,
    });

    res.status(200).json({
      success: true,
      message: 'User followed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
// @access  Public
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'followers',
      'name username profilePicture'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.followers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
// @access  Public
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'following',
      'name username profilePicture'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.following,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   PUT /api/users/deactivate
// @access  Private
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = false;
    await user.save();

    // Revoke all tokens
    await revokeAllUserTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account (soft delete)
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isDeleted = true;
    user.deletedAt = Date.now();
    user.isActive = false;
    await user.save();

    // Revoke all tokens
    await revokeAllUserTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user stats
// @route   GET /api/users/:id/stats
// @access  Public
exports.getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate additional stats
    const Reading = require('../models/Reading.model');
    const currentYear = new Date().getFullYear();

    // Run two aggregations in parallel:
    // 1) finished books this year (for totalBooks badge)
    // 2) ALL reading entries (currently_reading + finished) for total pages read
    const [finishedStats, pagesStats] = await Promise.all([
      Reading.aggregate([
        {
          $match: {
            user: user._id,
            status: 'finished',
            $or: [
              { finishDate: { $gte: new Date(currentYear, 0, 1), $lt: new Date(currentYear + 1, 0, 1) } },
              { finishDate: { $exists: false } },
              { finishDate: null },
            ],
          },
        },
        { $group: { _id: null, totalBooks: { $sum: 1 } } },
      ]),
      Reading.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ['currently_reading', 'finished'] },
          },
        },
        { $group: { _id: null, totalPages: { $sum: '$pagesRead' } } },
      ]),
    ]);

    const yearlyStats = {
      totalBooks: finishedStats[0]?.totalBooks || 0,
      totalPages: pagesStats[0]?.totalPages || 0,
    };

    const stats = {
      ...user.stats,
      yearly: yearlyStats,
      followers: user.followers.length,
      following: user.following.length,
      readingGoals: user.readingGoals,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user's public reviews
// @route   GET /api/users/:id/reviews
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.params.id, isHidden: { $ne: true } })
      .populate({ path: 'book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a user's public reading list (currently reading + recently finished)
// @route   GET /api/users/:id/reading
// @access  Public
exports.getUserReadingList = async (req, res, next) => {
  try {
    const entries = await Reading.find({
      user: req.params.id,
      status: { $in: ['currently_reading', 'finished'] },
    })
      .populate({ path: 'book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } })
      .sort('-updatedAt')
      .limit(20);

    const currentlyReading = entries.filter((e) => e.status === 'currently_reading');
    const recentlyFinished = entries.filter((e) => e.status === 'finished').slice(0, 5);

    res.status(200).json({ success: true, data: { currentlyReading, recentlyFinished } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get books published/submitted by a verified author
// @route   GET /api/users/:id/books
// @access  Public
exports.getUserPublishedBooks = async (req, res, next) => {
  try {
    const Author = require('../models/Author.model');
    const userId = req.params.id;

    // Find the Author profile claimed by this user
    const authorDoc = await Author.findOne({ claimedBy: userId });

    // Build query: books by their claimed Author record OR books they submitted directly
    const orConditions = [{ createdBy: userId }];
    if (authorDoc) orConditions.push({ author: authorDoc._id });

    const books = await Book.find({ $or: orConditions, status: { $in: ['approved', 'pending'] } })
      .select('title coverImage author averageRating ratingsCount publishedDate genres')
      .populate('author', 'name profilePhoto')
      .sort('-publishedDate')
      .limit(20);

    res.status(200).json({ success: true, data: books, authorId: authorDoc?._id || null });
  } catch (error) {
    next(error);
  }
};
