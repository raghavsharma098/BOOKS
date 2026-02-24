/**
 * Admin Club Controller
 * Admin-specific CRUD for book clubs.
 * Admin-created clubs go live immediately (status: 'approved').
 * Provides full moderation: approve, reject, suspend, edit, delete.
 */
const BookClub = require('../models/BookClub.model');
const { uploadToCloudinary } = require('../utils/imageUpload');
const notificationHelper = require('../utils/notificationHelper');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip undefined values so $set doesn't accidentally null-out fields */
const compact = (obj) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => v !== undefined)
);

// ─── READ ────────────────────────────────────────────────────────────────────

// @desc    Get all clubs (admin — all statuses)
// @route   GET /api/admin/clubs
// @access  Admin
exports.getAllClubsAdmin = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const filter = { isDeleted: { $ne: true } };
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.search) {
      filter.$or = [
        { name:        { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [clubs, total] = await Promise.all([
      BookClub.find(filter)
        .populate('creator', 'name email username profilePicture')
        .populate('selectedBooks.book', 'title coverImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      BookClub.countDocuments(filter),
    ]);

    // Status counts for tab badges
    const [pending, approved, rejected, suspended, draft] = await Promise.all([
      BookClub.countDocuments({ status: 'pending',   isDeleted: { $ne: true } }),
      BookClub.countDocuments({ status: 'approved',  isDeleted: { $ne: true } }),
      BookClub.countDocuments({ status: 'rejected',  isDeleted: { $ne: true } }),
      BookClub.countDocuments({ status: 'suspended', isDeleted: { $ne: true } }),
      BookClub.countDocuments({ status: 'draft',     isDeleted: { $ne: true } }),
    ]);

    res.status(200).json({
      success: true,
      count: clubs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      counts: { pending, approved, rejected, suspended, draft },
      data: clubs,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

// @desc    Create a club (admin — goes live immediately as 'approved')
// @route   POST /api/admin/clubs
// @access  Admin
exports.createClubAdmin = async (req, res, next) => {
  try {
    let coverImage;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'club-covers');
      coverImage = result.url;
    }

    const {
      name, description, clubType, privacy,
      selectedBooks, discussionStructure, maxMembers,
      tags, genreFocus, isFeatured, isEditorial, isVerified,
      status,
    } = req.body;

    const club = await BookClub.create({
      name,
      description,
      clubType: clubType || 'editorial_pick',
      privacy: privacy || 'public',
      coverImage,
      selectedBooks: selectedBooks
        ? (Array.isArray(selectedBooks) ? selectedBooks : JSON.parse(selectedBooks))
        : [],
      discussionStructure: discussionStructure || 'open',
      maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
      tags: tags
        ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean))
        : [],
      genreFocus,
      // Admin-only quality markers
      isFeatured:  isFeatured  === 'true' || isFeatured  === true,
      isEditorial: isEditorial === 'true' || isEditorial === true,
      isVerified:  isVerified  === 'true' || isVerified  === true,
      // Admin-created clubs go live immediately
      status: status || 'approved',
      creator: req.user._id,
      admins:  [req.user._id],
      members: [{ user: req.user._id, role: 'admin' }],
      memberCount: 1,
    });

    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

// @desc    Edit any club field (admin)
// @route   PUT /api/admin/clubs/:id
// @access  Admin
exports.updateClubAdmin = async (req, res, next) => {
  try {
    const club = await BookClub.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    // New cover image?
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'club-covers');
      req.body.coverImage = result.url;
    }

    const {
      name, description, clubType, privacy,
      discussionStructure, maxMembers, tags, genreFocus, coverImage,
      isFeatured, isEditorial, isVerified, status,
      rejectionReason, suspendReason,
    } = req.body;

    const updates = compact({
      name,
      description,
      clubType,
      privacy,
      discussionStructure,
      maxMembers: maxMembers !== undefined ? (maxMembers === '' ? undefined : parseInt(maxMembers)) : undefined,
      tags: tags !== undefined
        ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean))
        : undefined,
      genreFocus,
      coverImage,
      isFeatured:  isFeatured  !== undefined ? (isFeatured  === 'true' || isFeatured  === true) : undefined,
      isEditorial: isEditorial !== undefined ? (isEditorial === 'true' || isEditorial === true) : undefined,
      isVerified:  isVerified  !== undefined ? (isVerified  === 'true' || isVerified  === true) : undefined,
      status,
      rejectionReason,
      suspendReason,
    });

    Object.assign(club, updates);
    await club.save();

    // If status changed to approved, notify creator
    if (status === 'approved' && club.status !== 'approved') {
      await notificationHelper.createNotification({
        recipient: club.creator,
        type: 'system',
        title: 'Book Club Approved',
        message: `Your book club "${club.name}" is now live!`,
      }).catch(() => {});
    }

    res.status(200).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
};

// ─── STATUS TRANSITIONS ───────────────────────────────────────────────────────

// @desc    Approve club (pending → approved)
// @route   PATCH /api/admin/clubs/:id/approve
// @access  Admin
exports.approveClubAdmin = async (req, res, next) => {
  try {
    const club = await BookClub.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', rejectionReason: undefined },
      { new: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    await notificationHelper.createNotification({
      recipient: club.creator,
      type: 'system',
      title: 'Book Club Approved!',
      message: `Your book club "${club.name}" is now live and visible to readers.`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club approved', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject club
// @route   PATCH /api/admin/clubs/:id/reject
// @access  Admin
exports.rejectClubAdmin = async (req, res, next) => {
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
      message: `Your book club "${club.name}" was not approved. Reason: ${reason || 'See community guidelines.'}`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club rejected', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend an approved club
// @route   PATCH /api/admin/clubs/:id/suspend
// @access  Admin
exports.suspendClubAdmin = async (req, res, next) => {
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
      message: `Your book club "${club.name}" has been temporarily suspended. Reason: ${reason || 'See guidelines.'}`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club suspended', data: club });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsuspend / restore a club back to approved
// @route   PATCH /api/admin/clubs/:id/restore
// @access  Admin
exports.restoreClubAdmin = async (req, res, next) => {
  try {
    const club = await BookClub.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', suspendReason: undefined },
      { new: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    await notificationHelper.createNotification({
      recipient: club.creator,
      type: 'system',
      title: 'Book Club Restored',
      message: `Your book club "${club.name}" has been restored and is live again.`,
    }).catch(() => {});

    res.status(200).json({ success: true, message: 'Club restored', data: club });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

// @desc    Soft-delete a club (admin)
// @route   DELETE /api/admin/clubs/:id
// @access  Admin
exports.deleteClubAdmin = async (req, res, next) => {
  try {
    const club = await BookClub.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    club.isDeleted = true;
    await club.save();

    res.status(200).json({ success: true, message: 'Club deleted' });
  } catch (error) {
    next(error);
  }
};
