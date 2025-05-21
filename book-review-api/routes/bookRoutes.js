const express = require('express');
const router = express.Router();
const {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  searchBooks
} = require('../controllers/bookController');
const { getBookReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validation');

// Search route
router.get('/search', searchBooks);

// Book routes
router.route('/books')
  .get(getBooks)
  .post(protect, validationRules.createBook, validate, createBook);

router.route('/books/:id')
  .get(validationRules.validateBookId, validate, getBook)
  .put(protect, validationRules.validateBookId, validationRules.createBook, validate, updateBook)
  .delete(protect, validationRules.validateBookId, validate, deleteBook);

// Book review routes
router.route('/books/:id/reviews')
  .get(validationRules.validateBookId, validate, getBookReviews)
  .post(
    protect,
    validationRules.validateBookId,
    validationRules.createReview,
    validate,
    addReview
  );

module.exports = router;