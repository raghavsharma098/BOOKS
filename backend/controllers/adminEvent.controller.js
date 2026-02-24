const Event = require('../models/Event.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/imageUpload');

// @desc    Get all events (admin – all statuses)
// @route   GET /api/admin/events
// @access  Admin
exports.getAllEventsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { isDeleted: { $ne: true } };
    if (req.query.status) query.status = req.query.status;
    if (req.query.featured === 'true') query.isFeatured = true;

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({ success: true, count: events.length, total, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a featured event (admin)
// @route   POST /api/admin/events
// @access  Admin
exports.createEventAdmin = async (req, res, next) => {
  try {
    let coverImage;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'event-covers');
      coverImage = result.url;
    }

    const {
      title, description, type, city, venue, address,
      startDate, endDate, organizer, maxAttendees,
      bookingLink, isFeatured, status,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      type: type || 'other',
      city: city || 'Online',
      venue,
      address,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      organizer: organizer || 'Admin',
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
      bookingLink: bookingLink || undefined,
      coverImage,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      status: status || 'approved',
      createdBy: req.user._id,
      createdByType: 'admin',
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (admin)
// @route   PUT /api/admin/events/:id
// @access  Admin
exports.updateEventAdmin = async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (req.file) {
      // Delete old image
      if (event.coverImage && event.coverImage.startsWith('/uploads')) {
        const publicId = event.coverImage.replace('/uploads/', '');
        await deleteFromCloudinary(publicId).catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'event-covers');
      event.coverImage = result.url;
    }

    const fields = [
      'title', 'description', 'type', 'city', 'venue', 'address',
      'startDate', 'endDate', 'organizer', 'maxAttendees',
      'bookingLink', 'status',
    ];
    fields.forEach(f => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    if (req.body.isFeatured !== undefined) {
      event.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }

    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete event (admin)
// @route   DELETE /api/admin/events/:id
// @access  Admin
exports.deleteEventAdmin = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.isDeleted = true;
    await event.save();
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
