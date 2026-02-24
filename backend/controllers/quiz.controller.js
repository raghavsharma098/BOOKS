const QuizQuestion = require('../models/QuizQuestion.model');
const User = require('../models/User.model');

// @desc    Get all active quiz questions
// @route   GET /api/quiz/questions
// @access  Public
exports.getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await QuizQuestion.find({ isActive: true }).sort('order');

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/submit
// @access  Private
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide quiz answers',
      });
    }

    const user = await User.findById(req.user._id);

    // Save answers
    user.quizAnswers = new Map(Object.entries(answers));
    user.quizCompletedAt = Date.now();

    // Process answers to update preferences
    const processedPreferences = processQuizAnswers(answers);
    user.preferredGenres = processedPreferences.genres;
    user.moodPreferences = processedPreferences.moods;
    user.readingPace = processedPreferences.pace;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        preferences: processedPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user quiz answers
// @route   GET /api/quiz/my-answers
// @access  Private
exports.getMyAnswers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.quizAnswers || user.quizAnswers.size === 0) {
      return res.status(404).json({
        success: false,
        message: 'No quiz answers found',
      });
    }

    const answers = Object.fromEntries(user.quizAnswers);

    res.status(200).json({
      success: true,
      data: {
        answers,
        completedAt: user.quizCompletedAt,
        preferences: {
          genres: user.preferredGenres,
          moods: user.moodPreferences,
          pace: user.readingPace,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retake quiz (clear previous answers)
// @route   DELETE /api/quiz/retake
// @access  Private
exports.retakeQuiz = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.quizAnswers = new Map();
    user.quizCompletedAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quiz reset successfully. You can now retake it.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin routes

// @desc    Create quiz question
// @route   POST /api/quiz/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await QuizQuestion.create(req.body);

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz question
// @route   PUT /api/quiz/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await QuizQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz question
// @route   DELETE /api/quiz/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await QuizQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to process quiz answers
function processQuizAnswers(answers) {
  const genresSet = new Set();
  const moodsSet = new Set();
  let paceScore = 0;
  let paceCount = 0;

  Object.values(answers).forEach((answer) => {
    if (Array.isArray(answer)) {
      answer.forEach((a) => {
        if (a.genres) genresSet.add(...a.genres);
        if (a.moods) moodsSet.add(...a.moods);
        if (a.pace) {
          paceScore += getPaceScore(a.pace);
          paceCount++;
        }
      });
    } else if (typeof answer === 'object') {
      if (answer.genres) genresSet.add(...answer.genres);
      if (answer.moods) moodsSet.add(...answer.moods);
      if (answer.pace) {
        paceScore += getPaceScore(answer.pace);
        paceCount++;
      }
    }
  });

  const averagePaceScore = paceCount > 0 ? paceScore / paceCount : 2;
  const pace = averagePaceScore < 1.5 ? 'slow' : averagePaceScore < 2.5 ? 'medium' : 'fast';

  return {
    genres: Array.from(genresSet).slice(0, 10),
    moods: Array.from(moodsSet).slice(0, 10),
    pace,
  };
}

function getPaceScore(pace) {
  const scores = { slow: 1, medium: 2, fast: 3 };
  return scores[pace] || 2;
}
