const BookClub = require('../models/BookClub.model');
const ClubDiscussion = require('../models/ClubDiscussion.model');
const DiscussionReply = require('../models/DiscussionReply.model');
const { uploadToCloudinary } = require('../utils/imageUpload');
const activityHelper = require('../utils/activityHelper');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get all clubs (public — approved only)
// @route   GET /api/clubs
// @access  Public
exports.getClubs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Only surface approved, non-deleted clubs to the public
    const query = { status: 'approved', isDeleted: { $ne: true } };

    if (req.query.type) {
      query.clubType = req.query.type;
    }
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const clubs = await BookClub.find(query)
      .populate('creator', 'name username profilePicture')
      .sort('-memberCount')
      .skip(skip)
      .limit(limit);

    const total = await BookClub.countDocuments(query);

    res.status(200).json({
      success: true,
      count: clubs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's own clubs (created + joined, all statuses)
// @route   GET /api/clubs/mine
// @access  Private
exports.getMyClubs = async (req, res, next) => {
  try {
    const clubs = await BookClub.find({
      $or: [
        { creator: req.user._id },
        { 'members.user': req.user._id },
      ],
      isDeleted: { $ne: true },
    })
      .populate('creator', 'name username profilePicture')
      .populate('selectedBooks.book', 'title coverImage')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: clubs.length, data: clubs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:id
// @access  Public
exports.getClub = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id)
      .populate('creator', 'name username profilePicture')
      .populate('admins', 'name username profilePicture')
      .populate('members.user', 'name username profilePicture')
      .populate('joinRequests.user', 'name username profilePicture')
      .populate({ path: 'selectedBooks.book', select: 'title coverImage pageCount', populate: { path: 'author', select: 'name' } })
      .populate({ path: 'completedBooks.book', select: 'title coverImage', populate: { path: 'author', select: 'name' } });

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    res.status(200).json({
      success: true,
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create club (user / verified author)
// @route   POST /api/clubs
// @access  Private (any logged-in user)
exports.createClub = async (req, res, next) => {
  try {
    // Handle cover image and club logo (req.files from upload.fields())
    if (req.files?.coverImage?.[0]) {
      const result = await uploadToCloudinary(req.files.coverImage[0].buffer, 'club-covers');
      req.body.coverImage = result.url;
    }
    if (req.files?.clubLogo?.[0]) {
      const result = await uploadToCloudinary(req.files.clubLogo[0].buffer, 'club-logos');
      req.body.clubLogo = result.url;
    }

    // Whitelist only the fields users are allowed to set.
    // Status is always 'pending' — no user can bypass admin review.
    const {
      name, description, clubType, privacy,
      coverImage, clubLogo, discussionStructure,
      maxMembers, tags, genreFocus,
    } = req.body;

    // selectedBooks can arrive as a single string or an array depending on FormData
    const rawBooks = req.body.selectedBooks || req.body['selectedBooks[]'] || [];
    const booksArray = Array.isArray(rawBooks) ? rawBooks : [rawBooks].filter(Boolean);
    // Wrap plain IDs into the schema shape { book: id }
    const selectedBooks = booksArray
      .filter((id) => id && id.match(/^[a-f\d]{24}$/i))
      .map((id) => ({ book: id }));

    const clubData = {
      name,
      description,
      clubType: clubType || 'genre',
      privacy: privacy || 'public',
      coverImage,
      clubLogo,
      selectedBooks: Array.isArray(selectedBooks) ? selectedBooks : [],
      discussionStructure: discussionStructure || 'open',
      maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      genreFocus,
      creator: req.user._id,
      admins: [req.user._id],
      members: [{ user: req.user._id, role: 'admin' }],
      memberCount: 1,
      // Always pending — admin must approve before club goes public
      status: 'pending',
      // Users can NEVER set these flags
      isFeatured: false,
      isEditorial: false,
      isVerified: false,
    };

    const club = await BookClub.create(clubData);

    // Log activity
    await activityHelper.logClubCreated(req.user._id, club._id, club.name);

    res.status(201).json({
      success: true,
      message: 'Club submitted for review. It will be visible publicly once approved by an admin.',
      data: club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join club
// @route   POST /api/clubs/:id/join
// @access  Private
exports.joinClub = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Check if already a member
    const isMember = club.members.some(m => m.user.toString() === req.user._id.toString());

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club',
      });
    }

    // Check if already has a pending join request
    const hasRequest = club.joinRequests.some(r => r.user.toString() === req.user._id.toString());
    if (hasRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending join request for this club',
      });
    }

    if (club.privacy === 'private') {
      // Add to join requests
      club.joinRequests.push({
        user: req.user._id,
        message: req.body.message,
      });
      await club.save();

      // Notify admins
      for (const adminId of club.admins) {
        await notificationHelper.createNotification({
          user: adminId,
          type: 'club_update',
          title: 'New Club Join Request',
          message: `${req.user.name} requested to join ${club.name}`,
          relatedClub: club._id,
          relatedUser: req.user._id,
          actionUrl: `/clubs/${club._id}/requests`,
          sendEmail: true,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Join request sent successfully',
      });
    }

    // Public club - join directly
    club.addMember(req.user._id);
    await club.save();

    // Log activity
    await activityHelper.logClubJoined(req.user._id, club._id, club.name);

    res.status(200).json({
      success: true,
      message: 'Joined club successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave club
// @route   DELETE /api/clubs/:id/members
// @access  Private
exports.leaveClub = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    if (club.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Club creator cannot leave. Please transfer ownership or delete the club.',
      });
    }

    club.removeMember(req.user._id);
    await club.save();

    res.status(200).json({
      success: true,
      message: 'Left club successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get join requests for a private club
// @route   GET /api/clubs/:id/requests
// @access  Private (owner / admin only)
exports.getJoinRequests = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id)
      .populate('joinRequests.user', 'name username profilePicture');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isOwner = club.creator.toString() === req.user._id.toString();
    const isAdmin = club.admins.some(a => a.toString() === req.user._id.toString());
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view join requests' });
    }

    res.status(200).json({ success: true, count: club.joinRequests.length, data: club.joinRequests });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a join request
// @route   POST /api/clubs/:id/requests/:userId/accept
// @access  Private (owner / admin only)
exports.acceptJoinRequest = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isOwner = club.creator.toString() === req.user._id.toString();
    const isAdmin = club.admins.some(a => a.toString() === req.user._id.toString());
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const requestIndex = club.joinRequests.findIndex(r => r.user.toString() === req.params.userId);
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    // Remove from joinRequests and add to members
    club.joinRequests.splice(requestIndex, 1);
    club.addMember(req.params.userId);
    await club.save();

    // Notify the accepted user
    await notificationHelper.createNotification({
      user: req.params.userId,
      type: 'club_update',
      title: 'Join Request Accepted',
      message: `Your request to join "${club.name}" has been accepted!`,
      relatedClub: club._id,
      actionUrl: `/clubs/${club._id}`,
    });

    res.status(200).json({ success: true, message: 'Join request accepted. User added to club.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a join request
// @route   DELETE /api/clubs/:id/requests/:userId
// @access  Private (owner / admin only)
exports.rejectJoinRequest = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isOwner = club.creator.toString() === req.user._id.toString();
    const isAdmin = club.admins.some(a => a.toString() === req.user._id.toString());
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const before = club.joinRequests.length;
    club.joinRequests = club.joinRequests.filter(r => r.user.toString() !== req.params.userId);
    if (club.joinRequests.length === before) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    await club.save();

    res.status(200).json({ success: true, message: 'Join request rejected.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create discussion
// @route   POST /api/clubs/:id/discussions
// @access  Private
exports.createDiscussion = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found',
      });
    }

    // Check if user is a member
    const isMember = club.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a club member to create discussions',
      });
    }

    const discussion = await ClubDiscussion.create({
      club: club._id,
      createdBy: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: discussion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get club discussions (with embedded replies)
// @route   GET /api/clubs/:id/discussions
// @access  Public
exports.getDiscussions = async (req, res, next) => {
  try {
    const discussions = await ClubDiscussion.find({
      club: req.params.id,
      isDeleted: false,
    })
      .populate('createdBy', 'name username profilePicture')
      .populate('book', 'title coverImage')
      .sort({ isPinned: -1, lastActivityAt: -1 });

    // Embed replies (up to 30 per discussion)
    const withReplies = await Promise.all(
      discussions.map(async (d) => {
        const replies = await DiscussionReply.find({ discussion: d._id, isDeleted: false })
          .populate('user', 'name username profilePicture')
          .sort('createdAt')
          .limit(30);
        return { ...d.toObject(), replies };
      })
    );

    res.status(200).json({
      success: true,
      count: withReplies.length,
      data: withReplies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to discussion
// @route   POST /api/clubs/discussions/:id/replies
// @access  Private
exports.addReply = async (req, res, next) => {
  try {
    const discussion = await ClubDiscussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found',
      });
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked',
      });
    }

    const reply = await DiscussionReply.create({
      discussion: discussion._id,
      user: req.user._id,
      content: req.body.content,
    });

    discussion.replyCount += 1;
    discussion.lastActivityAt = Date.now();
    await discussion.save();

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update calling member's reading progress for the club's current book
// @route   PATCH /api/clubs/:id/progress
// @access  Private (member or creator)
exports.updateMemberProgress = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id).populate({
      path: 'selectedBooks.book',
      select: 'pageCount',
    });

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Caller must be a member or the creator
    const memberEntry = club.members.find(
      (m) => (m.user._id ?? m.user).toString() === req.user._id.toString()
    );
    const isCreator = club.creator.toString() === req.user._id.toString();

    if (!memberEntry && !isCreator) {
      return res.status(403).json({ success: false, message: 'You are not a member of this club' });
    }

    const pagesRead = Number(req.body.pagesRead);
    if (isNaN(pagesRead) || pagesRead < 0) {
      return res.status(400).json({ success: false, message: 'pagesRead must be a non-negative number' });
    }

    // Get page count from current book
    const currentBookEntry = club.selectedBooks.find((sb) => sb.isCurrentRead) || club.selectedBooks[0];
    const totalPages = currentBookEntry?.book?.pageCount || 0;
    const progressPercent = totalPages > 0 ? Math.min(100, Math.round((pagesRead / totalPages) * 100)) : 0;

    if (memberEntry) {
      memberEntry.currentPage = pagesRead;
      memberEntry.progress = progressPercent;
    } else {
      // Creator may not be in members array — push them
      club.members.push({
        user: req.user._id,
        currentPage: pagesRead,
        progress: progressPercent,
        role: 'admin',
      });
    }

    await club.save();

    res.status(200).json({
      success: true,
      data: { currentPage: pagesRead, progress: progressPercent, totalPages },
    });
  } catch (error) {
    next(error);
  }
};
