const { body, param, query, validationResult } = require('express-validator');

// Validation result checker
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validations
exports.signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// User validations
exports.updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
];

// Book validations
exports.createBookValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('genres')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
  body('pageCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page count must be a positive number'),
];

// Review validations
exports.createReviewValidation = [
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('reviewText')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Review cannot exceed 2000 characters'),
];

// Club validations
exports.createClubValidation = [
  body('name').trim().notEmpty().withMessage('Club name is required'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('clubType')
    .isIn(['emotional', 'genre', 'buddy_read', 'author_led', 'editorial_pick'])
    .withMessage('Invalid club type'),
  body('privacy')
    .isIn(['public', 'private'])
    .withMessage('Privacy must be public or private'),
];

// Event validations
exports.createEventValidation = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type')
    .isIn(['meetup', 'launch', 'festival', 'signing', 'workshop', 'other'])
    .withMessage('Invalid event type'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('organizer').trim().notEmpty().withMessage('Organizer name is required'),
];

// Giveaway validations
exports.createGiveawayValidation = [
  body('title').trim().notEmpty().withMessage('Giveaway title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('book').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid book ID'),
  body('endDate').isISO8601().withMessage('Please provide a valid end date'),
  body('numberOfWinners')
    .isInt({ min: 1 })
    .withMessage('Number of winners must be at least 1'),
];

// ObjectId validation
exports.validateObjectId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage('Invalid ID format'),
];
