const Review = require('../models/Review');
const Book = require('../models/Book');
const { ApiError, asyncHandler } = require('../utils/errorHandler');

exports.addReview = asyncHandler(async (req, res, next) => {
  const { title, rating, comment } = req.body;
  const bookId = req.params.id;

  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ApiError(`No book found with id ${bookId}`, 404));
  }

  const existingReview = await Review.findOne({
    book: bookId,
    user: req.user.id
  });

  if (existingReview) {
    return next(new ApiError('You have already reviewed this book', 400));
  }

  const review = await Review.create({
    title,
    rating,
    comment,
    book: bookId,
    user: req.user.id
  });

  await review.populate({
    path: 'user',
    select: 'name'
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(`No review found with id ${req.params.id}`, 404));
  }

  if (review.user.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to update this review', 403));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await review.populate({
    path: 'user',
    select: 'name'
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(`No review found with id ${req.params.id}`, 404));
  }

  if (review.user.toString() !== req.user.id) {
    return next(new ApiError('Not authorized to delete this review', 403));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getBookReviews = asyncHandler(async (req, res, next) => {
  const bookId = req.params.id;

  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ApiError(`No book found with id ${bookId}`, 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const reviews = await Review.find({ book: bookId })
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt')
    .populate({
      path: 'user',
      select: 'name'
    });

  const total = await Review.countDocuments({ book: bookId });

  const pagination = {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  };

  res.status(200).json({
    success: true,
    pagination,
    count: reviews.length,
    data: reviews
  });
});

 
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .sort('-createdAt')
    .populate([
      {
        path: 'user',
        select: 'name'
      },
      {
        path: 'book',
        select: 'title'
      }
    ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});
