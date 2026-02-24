const Author = require('../models/Author.model');
const Book = require('../models/Book.model');
const { uploadToCloudinary } = require('../utils/imageUpload');

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
exports.getAuthors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    if (req.query.verified === 'true') {
      query.isVerified = true;
    }

    const authors = await Author.find(query)
      .populate('claimedBy', 'name username')
      .sort('-averageRating')
      .skip(skip)
      .limit(limit);

    const total = await Author.countDocuments(query);

    res.status(200).json({
      success: true,
      count: authors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single author
// @route   GET /api/authors/:id
// @access  Public
exports.getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id).populate('claimedBy', 'name username');

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }

    // Get author's books
    const books = await Book.find({ author: author._id, status: 'approved' })
      .select('title coverImage averageRating totalRatings publicationDate')
      .sort('-averageRating');

    res.status(200).json({
      success: true,
      data: {
        author,
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim author profile
// @route   POST /api/authors/:id/claim
// @access  Private
exports.claimAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }

    if (author.claimedBy) {
      return res.status(400).json({
        success: false,
        message: 'This author profile is already claimed',
      });
    }

    if (author.claimRequestStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'A claim request is already pending for this author',
      });
    }

    const { email, proof } = req.body;

    author.claimedBy = req.user._id;
    author.claimRequestStatus = 'pending';
    author.status = 'claim_requested';
    if (email) author.claimEmail = email;
    if (proof) author.claimProof = proof;
    await author.save();

    // Notify admins
    const notificationHelper = require('../utils/notificationHelper');
    const User = require('../models/User.model');
    const admins = await User.find({ role: { $in: ['admin', 'editorial_admin'] } });

    for (const admin of admins) {
      await notificationHelper.createNotification({
        user: admin._id,
        type: 'general',
        title: 'New Author Claim Request',
        message: `${req.user.name} requested to claim author "${author.name}"`,
        actionUrl: `/admin/authors/${author._id}/claim-requests`,
        sendEmail: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Claim request submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject author claim (Admin)
// @route   PUT /api/authors/:id/claim-status
// @access  Private/Admin
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const author = await Author.findById(req.params.id).populate('claimedBy');

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }

    author.claimRequestStatus = status;

    if (status === 'approved') {
      author.isVerified = true;
      author.status = 'verified';
      
      // Update user role to verified author
      const User = require('../models/User.model');
      await User.findByIdAndUpdate(author.claimedBy._id, { role: 'verified_author' });
    } else if (status === 'rejected') {
      author.status = 'unclaimed';
    }

    // Capture claimedBy id before potentially clearing it
    const claimedUserId = author.claimedBy?._id || author.claimedBy;

    if (status === 'rejected') {
      author.claimedBy = null;
    }

    await author.save();

    // Send notification to claimant
    if (claimedUserId) {
      const notificationHelper = require('../utils/notificationHelper');
      await notificationHelper.createNotification({
        user: claimedUserId,
        type: status === 'approved' ? 'author_claim_approved' : 'author_claim_rejected',
        title: `Author Claim ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your claim for author "${author.name}" has been ${status}`,
        actionUrl: `/authors/${author._id}`,
        sendEmail: true,
      });
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update author profile (Verified Author)
// @route   PUT /api/authors/:id
// @access  Private/Verified Author
exports.updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found',
      });
    }

    // Check if user owns this author profile
    if (
      author.claimedBy?.toString() !== req.user._id.toString() &&
      !['admin', 'editorial_admin'].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this author profile',
      });
    }

    const allowedUpdates = ['bio', 'profilePhoto', 'socialLinks'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle profile photo upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'author-photos');
      updates.profilePhoto = result.url;
    }

    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedAuthor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow an author (toggle)
// @route   POST /api/authors/:id/follow
// @access  Private
exports.followAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    const userId = req.user._id.toString();
    const alreadyFollowing = author.followers.some((f) => f.toString() === userId);

    if (alreadyFollowing) {
      author.followers = author.followers.filter((f) => f.toString() !== userId);
      author.followersCount = Math.max(0, (author.followersCount || 0) - 1);
    } else {
      author.followers.push(req.user._id);
      author.followersCount = (author.followersCount || 0) + 1;
    }

    await author.save();

    res.status(200).json({
      success: true,
      isFollowing: !alreadyFollowing,
      followersCount: author.followersCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's own author claim status
// @route   GET /api/authors/my-claim
// @access  Private
exports.getMyClaim = async (req, res, next) => {
  try {
    const author = await Author.findOne({ claimedBy: req.user._id });
    if (!author) {
      return res.status(200).json({ success: true, status: 'none' });
    }
    return res.status(200).json({
      success: true,
      status: author.claimRequestStatus || 'none',
      authorId: author._id,
      authorName: author.name,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending author claim requests (Admin)
// @route   GET /api/authors/claim-requests
// @access  Private/Admin
exports.getClaimRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { claimRequestStatus: 'pending' };

    const authors = await Author.find(query)
      .populate('claimedBy', 'name email username profilePicture')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit);

    const total = await Author.countDocuments(query);

    res.status(200).json({
      success: true,
      count: authors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};
