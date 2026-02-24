const express = require('express');
const router = express.Router();
const {
  getQuizQuestions,
  submitQuiz,
  getMyAnswers,
  retakeQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/quiz.controller');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// Public routes
router.get('/questions', getQuizQuestions);

// Protected routes
router.post('/submit', protect, submitQuiz);
router.get('/my-answers', protect, getMyAnswers);
router.delete('/retake', protect, retakeQuiz);

// Admin routes
router.post('/questions', protect, authorize('admin', 'editorial_admin'), createQuestion);
router.put(
  '/questions/:id',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  updateQuestion
);
router.delete(
  '/questions/:id',
  protect,
  authorize('admin', 'editorial_admin'),
  validateObjectId('id'),
  validate,
  deleteQuestion
);

module.exports = router;
