const Book = require('../models/Book.model');
const Reading = require('../models/Reading.model');
const Review = require('../models/Review.model');
const User = require('../models/User.model');
const openai = require('../config/openai');

// @desc    Get personalized recommendations (Rule-based)
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const limit = parseInt(req.query.limit) || 10;

    // Get user's reading history
    const readBooks = await Reading.find({ user: user._id }).select('book');
    const readBookIds = readBooks.map(r => r.book);

    // Build recommendation query
    const query = {
      _id: { $nin: readBookIds },
      status: 'approved',
    };

    // Filter by preferred genres
    if (user.preferredGenres && user.preferredGenres.length > 0) {
      query.genres = { $in: user.preferredGenres };
    }

    // Filter by mood preferences
    if (user.moodPreferences && user.moodPreferences.length > 0) {
      query.moodTags = { $in: user.moodPreferences };
    }

    // Filter by reading pace
    if (user.readingPace) {
      query.readingPace = user.readingPace;
    }

    // Exclude content user wants to avoid
    if (user.contentAvoidance && user.contentAvoidance.length > 0) {
      query.contentWarnings = { $nin: user.contentAvoidance };
    }

    // Get recommendations sorted by rating and popularity
    const recommendations = await Book.find(query)
      .populate('author', 'name isVerified')
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      type: 'rule_based',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI-powered recommendations (OpenAI)
// @route   GET /api/recommendations/ai
// @access  Private
exports.getAIRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Get user's reading history
    const readings = await Reading.find({ 
      user: user._id,
      status: { $in: ['finished', 'currently_reading'] }
    })
      .populate('book', 'title author genres moodTags')
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } })
      .limit(10);

    // Get user's reviews
    const reviews = await Review.find({ user: user._id })
      .populate('book', 'title')
      .sort('-rating')
      .limit(5);

    // Build context for AI
    const readingHistory = readings.map(r => ({
      title: r.book?.title,
      author: r.book?.author?.name,
      genres: r.book?.genres,
      moods: r.book?.moodTags,
      status: r.status,
    }));

    const reviewedBooks = reviews.map(r => ({
      title: r.book?.title,
      rating: r.rating,
      emotion: r.emotionalReaction,
    }));

    const userPreferences = {
      genres: user.preferredGenres,
      moods: user.moodPreferences,
      pace: user.readingPace,
      avoidContent: user.contentAvoidance,
    };

    // Create prompt for OpenAI
    const prompt = `
You are a book recommendation expert. Based on the following user data, suggest 5 books that would be perfect for this reader. Return ONLY a JSON array of objects with fields: title, author, reason (brief explanation why it matches).

User Preferences: ${JSON.stringify(userPreferences)}
Reading History: ${JSON.stringify(readingHistory)}
Highly Rated Books: ${JSON.stringify(reviewedBooks)}

Provide diverse recommendations that match their taste but also introduce them to new experiences.
    `.trim();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a book recommendation expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;
    let recommendations;

    try {
      recommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      // If parsing fails, return rule-based recommendations as fallback
      return next();
    }

    // Try to match AI recommendations with actual books in database
    const matchedBooks = [];
    for (const rec of recommendations) {
      const book = await Book.findOne({
        $text: { $search: `${rec.title} ${rec.author}` },
        status: 'approved',
      }).populate('author', 'name isVerified');

      if (book) {
        matchedBooks.push({
          ...book.toObject(),
          aiReason: rec.reason,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: matchedBooks.length,
      data: matchedBooks,
      type: 'ai_powered',
      aiSuggestions: recommendations,
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    // Fall back to rule-based recommendations
    return exports.getRecommendations(req, res, next);
  }
};

// @desc    Get trending books
// @route   GET /api/recommendations/trending
// @access  Public
exports.getTrendingBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const daysago = parseInt(req.query.days) || 30;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysago);

    // Get books with most activity in recent days
    const trendingBooks = await Book.find({
      status: 'approved',
      createdAt: { $lte: new Date() },
    })
      .populate('author', 'name isVerified')
      .sort({ 
        finishedCount: -1,
        currentlyReadingCount: -1,
        totalReviews: -1,
        averageRating: -1,
      })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: trendingBooks.length,
      data: trendingBooks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar books
// @route   GET /api/recommendations/similar/:bookId
// @access  Public
exports.getSimilarBooks = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    // Find similar books based on genres, moods, and author
    const similarBooks = await Book.find({
      _id: { $ne: book._id },
      status: 'approved',
      $or: [
        { genres: { $in: book.genres } },
        { moodTags: { $in: book.moodTags } },
        { author: book.author },
      ],
    })
      .populate('author', 'name isVerified')
      .sort({ averageRating: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: similarBooks.length,
      data: similarBooks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations based on mood
// @route   GET /api/recommendations/mood/:mood
// @access  Public
exports.getByMood = async (req, res, next) => {
  try {
    const { mood } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const books = await Book.find({
      status: 'approved',
      moodTags: mood,
    })
      .populate('author', 'name isVerified')
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
      mood,
    });
  } catch (error) {
    next(error);
  }
};
