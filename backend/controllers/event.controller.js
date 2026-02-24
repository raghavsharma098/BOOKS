const Event = require('../models/Event.model');
const { uploadToCloudinary } = require('../utils/imageUpload');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: 'approved', isDeleted: { $ne: true } };

    if (req.query.city) {
      query.city = new RegExp(req.query.city, 'i');
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.upcoming) {
      query.startDate = { $gte: new Date() };
    }
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name username')
      .populate('relatedBook', 'title coverImage')
      .populate('relatedAuthor', 'name')
      .sort('startDate')
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('relatedBook', 'title coverImage')
      .populate('relatedAuthor', 'name')
      .populate('rsvps.user', 'name username profilePicture');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Verified Author/Admin)
exports.createEvent = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'event-covers');
      req.body.coverImage = result.url;
    }

    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
      createdByType: req.user.role === 'admin' ? 'admin' : 'verified_author',
      status: req.user.role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
exports.rsvpEvent = async (req, res, next) => {
  try {
    const { status } = req.body; // 'going', 'interested'

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to this event',
      });
    }

    // Check max attendees
    if (event.maxAttendees && event.rsvpCount >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    event.addRSVP(req.user._id, status);
    await event.save();

    res.status(200).json({
      success: true,
      message: 'RSVP successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event status (Admin)
// @route   PUT /api/events/:id/status
// @access  Private/Admin
exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = status;
    if (status === 'rejected' && rejectionReason) {
      event.rejectionReason = rejectionReason;
    }

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featured flag on event (Admin)
// @route   PUT /api/events/:id/feature
// @access  Private/Admin
exports.featureEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Accept explicit value or toggle
    if (typeof req.body.isFeatured === 'boolean') {
      event.isFeatured = req.body.isFeatured;
    } else {
      event.isFeatured = !event.isFeatured;
    }

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
      message: `Event ${event.isFeatured ? 'marked as featured' : 'removed from featured'}`,
    });
  } catch (error) {
    next(error);
  }
};
