const express = require('express');
const router = express.Router();
const {
  updateReview,
  deleteReview,
  getAllReviews
} = require('../controllers/reviewController');

const { protect } = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validation');

// GET all reviews (with IDs, book titles, and user names)
router.get('/reviews', protect, getAllReviews);

router.route('/reviews/:id')
  .put(
    protect,
    validationRules.validateReviewId,
    validationRules.createReview,
    validate,
    updateReview
  )
  .delete(
    protect,
    validationRules.validateReviewId,
    validate,
    deleteReview
  );

module.exports = router;
