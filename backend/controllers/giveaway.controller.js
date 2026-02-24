const Giveaway = require('../models/Giveaway.model');
const { uploadToCloudinary } = require('../utils/imageUpload');
const notificationHelper = require('../utils/notificationHelper');
const { getGiveawayWinnerTemplate } = require('../utils/emailTemplates');
const { sendEmail } = require('../config/email');
const User = require('../models/User.model');

// @desc    Get all giveaways
// @route   GET /api/giveaways
// @access  Public (limited) | Admin (all)
exports.getGiveaways = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'editorial_admin');

    // Admins see everything; public sees only active/ended
    const query = isAdmin
      ? { isDeleted: { $ne: true } }
      : { status: { $in: ['active', 'ended'] } };

    if (req.query.active === 'true') {
      query.status = 'active';
      query.endDate = { $gt: new Date() };
    }

    const giveaways = await Giveaway.find(query)
      .populate('book', 'title coverImage author')
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } })
      .sort('-startDate')
      .skip(skip)
      .limit(limit);

    const total = await Giveaway.countDocuments(query);

    res.status(200).json({
      success: true,
      count: giveaways.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: giveaways,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single giveaway
// @route   GET /api/giveaways/:id
// @access  Public
exports.getGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id)
      .populate('book', 'title coverImage author')
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } })
      .populate('winners.user', 'name username profilePicture');

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: 'Giveaway not found',
      });
    }

    res.status(200).json({
      success: true,
      data: giveaway,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create giveaway (Admin)
// @route   POST /api/giveaways
// @access  Private/Admin
exports.createGiveaway = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'giveaway-covers');
      req.body.coverImage = result.url;
    }

    const giveaway = await Giveaway.create({
      ...req.body,
      createdBy: req.user._id,
      status: 'approved',
    });

    res.status(201).json({
      success: true,
      data: giveaway,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enter giveaway
// @route   POST /api/giveaways/:id/enter
// @access  Private
exports.enterGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id);

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: 'Giveaway not found',
      });
    }

    if (giveaway.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Giveaway is not active',
      });
    }

    if (new Date() > giveaway.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Giveaway has ended',
      });
    }

    // Check eligibility (admins bypass criteria)
    const user = await User.findById(req.user._id);
    if (req.user.role !== 'admin') {
      const { minBooksRead, minReviews } = giveaway.eligibilityCriteria;

      if (minBooksRead && (user.stats?.totalBooksRead ?? 0) < minBooksRead) {
        return res.status(403).json({
          success: false,
          message: `You need to have read at least ${minBooksRead} books to enter`,
        });
      }

      if (minReviews && (user.stats?.totalReviews ?? 0) < minReviews) {
        return res.status(403).json({
          success: false,
          message: `You need to have written at least ${minReviews} reviews to enter`,
        });
      }
    }

    // Check max entries
    if (giveaway.maxEntries && giveaway.entryCount >= giveaway.maxEntries) {
      return res.status(400).json({
        success: false,
        message: 'Giveaway entry limit reached',
      });
    }

    const entered = giveaway.addEntry(req.user._id);

    if (!entered) {
      return res.status(400).json({
        success: false,
        message: 'You have already entered this giveaway',
      });
    }

    await giveaway.save();

    res.status(200).json({
      success: true,
      message: 'Entered giveaway successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Select winners (Admin)
// @route   POST /api/giveaways/:id/select-winners
// @access  Private/Admin
exports.selectWinners = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id).populate('book');

    if (!giveaway) {
      return res.status(404).json({
        success: false,
        message: 'Giveaway not found',
      });
    }

    if (giveaway.status === 'winners_selected') {
      return res.status(400).json({
        success: false,
        message: 'Winners have already been selected',
      });
    }

    try {
      giveaway.selectWinners();
    } catch (modelErr) {
      return res.status(400).json({ success: false, message: modelErr.message });
    }
    await giveaway.save();

    // Notify winners (errors here must NOT fail the response)
    for (const winner of giveaway.winners) {
      try {
        const user = await User.findById(winner.user);
        if (!user) continue;

        try {
          await notificationHelper.createNotification({
            user: winner.user,
            type: 'giveaway_winner',
            title: 'Giveaway Winner!',
            message: `Congratulations! You won "${giveaway.title}"`,
            relatedGiveaway: giveaway._id,
            actionUrl: `/giveaways/${giveaway._id}`,
            sendEmail: true,
          });
        } catch (notifErr) {
          console.error('Error creating winner notification:', notifErr.message);
        }

        try {
          const bookTitle = giveaway.book?.title || giveaway.title;
          await sendEmail({
            to: user.email,
            subject: `You won: ${giveaway.title}`,
            html: getGiveawayWinnerTemplate(user.name, bookTitle, giveaway.title),
          });
        } catch (emailErr) {
          console.error('Error sending winner email:', emailErr.message);
        }
      } catch (winnerErr) {
        console.error('Error processing winner:', winnerErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: giveaway,
      message: 'Winners selected successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin-only endpoints ────────────────────────────────────────────────────

// @desc    Update giveaway details / status (admin)
// @route   PUT /api/giveaways/:id
// @access  Private/Admin
exports.updateGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'giveaway-covers');
      req.body.coverImage = result.url;
    }

    const allowedUpdates = [
      'title', 'description', 'coverImage', 'giveawayType', 'book', 'books',
      'startDate', 'endDate', 'numberOfWinners', 'maxEntries', 'eligibilityCriteria', 'status',
    ];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) giveaway[key] = req.body[key];
    });

    await giveaway.save();
    res.status(200).json({ success: true, data: giveaway });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish giveaway (draft / approved → active)
// @route   PATCH /api/giveaways/:id/publish
// @access  Private/Admin
exports.publishGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    if (!['draft', 'pending', 'approved'].includes(giveaway.status)) {
      return res.status(400).json({ success: false, message: `Cannot publish a giveaway with status: ${giveaway.status}` });
    }

    giveaway.status = 'active';
    if (!giveaway.startDate) giveaway.startDate = new Date();
    await giveaway.save();

    res.status(200).json({ success: true, message: 'Giveaway published', data: giveaway });
  } catch (error) {
    next(error);
  }
};

// @desc    Close / end giveaway
// @route   PATCH /api/giveaways/:id/close
// @access  Private/Admin
exports.closeGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { status: 'ended' },
      { new: true }
    );
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    res.status(200).json({ success: true, message: 'Giveaway closed', data: giveaway });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated entries for a giveaway (admin)
// @route   GET /api/giveaways/:id/entries
// @access  Private/Admin
exports.getGiveawayEntries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const giveaway = await Giveaway.findById(req.params.id)
      .populate({
        path: 'entries.user',
        select: 'name username email profilePicture',
        options: { skip, limit },
      });

    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    const entries = giveaway.entries.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      totalEntries: giveaway.entryCount,
      page,
      pages: Math.ceil(giveaway.entryCount / limit),
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually pick specific winners (admin)
// @route   POST /api/giveaways/:id/manual-winners
// @access  Private/Admin
exports.setWinnersManually = async (req, res, next) => {
  try {
    const { userIds } = req.body; // array of user ID strings
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide an array of userIds' });
    }

    const giveaway = await Giveaway.findById(req.params.id).populate('book');
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    if (giveaway.status === 'winners_selected') {
      return res.status(400).json({ success: false, message: 'Winners already selected' });
    }

    // Validate each userId is an actual entrant
    const entrantIds = giveaway.entries.map((e) => e.user.toString());
    const invalid = userIds.filter((id) => !entrantIds.includes(id));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `These users did not enter: ${invalid.join(', ')}` });
    }

    giveaway.winners = userIds.map((uid) => ({ user: uid, selectedAt: new Date(), notified: false }));
    giveaway.status = 'winners_selected';
    await giveaway.save();

    // Notify winners
    for (const uid of userIds) {
      const user = await User.findById(uid);
      if (!user) continue;
      await notificationHelper.createNotification({
        user: uid,
        type: 'giveaway_winner',
        title: 'Giveaway Winner!',
        message: `Congratulations! You won "${giveaway.title}"`,
        relatedGiveaway: giveaway._id,
        actionUrl: `/giveaways/${giveaway._id}`,
      }).catch(() => {});
    }

    res.status(200).json({ success: true, message: 'Winners set manually', data: giveaway });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete giveaway (admin)
// @route   DELETE /api/giveaways/:id
// @access  Private/Admin
exports.deleteGiveaway = async (req, res, next) => {
  try {
    const giveaway = await Giveaway.findById(req.params.id);
    if (!giveaway) return res.status(404).json({ success: false, message: 'Giveaway not found' });

    giveaway.isDeleted = true;
    await giveaway.save();

    res.status(200).json({ success: true, message: 'Giveaway deleted' });
  } catch (error) {
    next(error);
  }
};
