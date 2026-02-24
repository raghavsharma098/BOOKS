const Poll = require('../models/Poll.model');
const Book = require('../models/Book.model');

// @desc    Get active poll (public)
// @route   GET /api/polls/active
// @access  Public
exports.getActivePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ status: 'active', isDeleted: { $ne: true } })
      .populate({ path: 'books.book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } })
      .sort('-createdAt');

    if (!poll) {
      return res.status(200).json({ success: true, data: null });
    }

    // Attach total votes
    const totalVotes = poll.books.reduce((s, b) => s + (b.voteCount || 0), 0);

    // Check if requesting user has voted
    let userVotedBook = null;
    if (req.user) {
      const uv = poll.userVotes.find(v => String(v.user) === String(req.user._id));
      if (uv) userVotedBook = String(uv.book);
    }

    const result = {
      _id: poll._id,
      title: poll.title,
      year: poll.year,
      status: poll.status,
      totalVotes,
      userVotedBook,
      books: poll.books.map(b => ({
        book: b.book,
        voteCount: b.voteCount,
        percentage: totalVotes > 0 ? Math.round((b.voteCount / totalVotes) * 100) : 0,
      })),
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all polls (admin)
// @route   GET /api/polls
// @access  Admin
exports.getAllPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find({ isDeleted: { $ne: true } })
      .populate({ path: 'books.book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: polls.length, data: polls });
  } catch (error) {
    next(error);
  }
};

// @desc    Create poll (admin)
// @route   POST /api/polls
// @access  Admin
exports.createPoll = async (req, res, next) => {
  try {
    const { title, year, bookIds, status } = req.body;

    if (!bookIds || !Array.isArray(bookIds) || bookIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Please select at least 2 books for the poll' });
    }
    if (bookIds.length > 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 books per poll' });
    }

    // If activating this poll, deactivate all others
    if (status === 'active') {
      await Poll.updateMany({ status: 'active' }, { status: 'inactive' });
    }

    const poll = await Poll.create({
      title: title || "Best Choice's of Reader",
      year: year || new Date().getFullYear(),
      books: bookIds.map(id => ({ book: id, voteCount: 0 })),
      status: status || 'inactive',
      createdBy: req.user._id,
    });

    const populated = await poll.populate({ path: 'books.book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update poll (admin) – change books, title, status
// @route   PUT /api/polls/:id
// @access  Admin
exports.updatePoll = async (req, res, next) => {
  try {
    const { title, year, bookIds, status } = req.body;

    const poll = await Poll.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

    if (title !== undefined) poll.title = title;
    if (year !== undefined) poll.year = year;

    if (bookIds && Array.isArray(bookIds)) {
      if (bookIds.length < 2) return res.status(400).json({ success: false, message: 'At least 2 books required' });
      if (bookIds.length > 4) return res.status(400).json({ success: false, message: 'Maximum 4 books per poll' });
      // Preserve vote counts for existing books
      const existingMap = new Map(poll.books.map(b => [String(b.book), b.voteCount]));
      poll.books = bookIds.map(id => ({ book: id, voteCount: existingMap.get(String(id)) || 0 }));
    }

    if (status !== undefined) {
      if (status === 'active') {
        // Deactivate all other polls
        await Poll.updateMany({ _id: { $ne: poll._id }, status: 'active' }, { status: 'inactive' });
      }
      poll.status = status;
    }

    await poll.save();
    const populated = await poll.populate({ path: 'books.book', select: 'title coverImage author', populate: { path: 'author', select: 'name' } });

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete poll (admin)
// @route   DELETE /api/polls/:id
// @access  Admin
exports.deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
    poll.isDeleted = true;
    await poll.save();
    res.status(200).json({ success: true, message: 'Poll deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Cast a vote
// @route   POST /api/polls/:id/vote
// @access  Private (authenticated users)
exports.castVote = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ success: false, message: 'bookId is required' });

    const poll = await Poll.findOne({ _id: req.params.id, status: 'active', isDeleted: { $ne: true } });
    if (!poll) return res.status(404).json({ success: false, message: 'Active poll not found' });

    // Check book belongs to this poll
    const bookEntry = poll.books.find(b => String(b.book) === String(bookId));
    if (!bookEntry) return res.status(400).json({ success: false, message: 'Book is not part of this poll' });

    // Check if user already voted
    const existingVote = poll.userVotes.find(v => String(v.user) === String(req.user._id));
    if (existingVote) {
      // Change vote – remove old, add new
      const oldEntry = poll.books.find(b => String(b.book) === String(existingVote.book));
      if (oldEntry && oldEntry.voteCount > 0) oldEntry.voteCount -= 1;
      existingVote.book = bookId;
      existingVote.votedAt = new Date();
    } else {
      poll.userVotes.push({ user: req.user._id, book: bookId });
    }
    bookEntry.voteCount += 1;

    await poll.save();

    const totalVotes = poll.books.reduce((s, b) => s + b.voteCount, 0);
    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      data: {
        userVotedBook: String(bookId),
        books: poll.books.map(b => ({
          book: b.book,
          voteCount: b.voteCount,
          percentage: totalVotes > 0 ? Math.round((b.voteCount / totalVotes) * 100) : 0,
        })),
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};
