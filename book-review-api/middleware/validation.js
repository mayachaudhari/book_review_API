const { body, param, validationResult } = require('express-validator');
const { ApiError } = require('../utils/errorHandler');

/**
 * Validation rules for different operations
 */
exports.validationRules = {
  // User registration validation
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage('Name cannot exceed 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],

  // User login validation
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Book creation validation
  createBook: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('author')
      .trim()
      .notEmpty()
      .withMessage('Author is required')
      .isLength({ max: 100 })
      .withMessage('Author name cannot exceed 100 characters'),
    body('genre')
      .trim()
      .notEmpty()
      .withMessage('Genre is required')
      .isIn([
        'Fiction', 
        'Non-fiction', 
        'Science Fiction', 
        'Fantasy', 
        'Mystery', 
        'Thriller', 
        'Romance', 
        'Horror', 
        'Biography', 
        'History', 
        'Children', 
        'Young Adult',
        'Science',
        'Self-Help',
        'Other'
      ])
      .withMessage('Please select a valid genre'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('publishedYear')
      .optional()
      .isInt({ min: 0, max: new Date().getFullYear() })
      .withMessage(`Published year must be between 0 and ${new Date().getFullYear()}`),
    body('isbn')
      .optional()
      .matches(/^(?:\d[- ]?){9}[\dXx]$/)
      .withMessage('Please provide a valid ISBN')
  ],

  // Review creation validation
  createReview: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
  ],

  // Book ID validation (for routes with :id param)
  validateBookId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid book ID format')
  ],

  // Review ID validation (for routes with :id param)
  validateReviewId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid review ID format')
  ]
};

/**
 * Middleware to validate request data based on validation rules
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     
    const error = errors.array()[0];
    return next(new ApiError(error.msg, 400));
  }
  next();
};