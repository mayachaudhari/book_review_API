const Book = require('../models/Book');
const Review = require('../models/Review');
const { ApiError, asyncHandler } = require('../utils/errorHandler');

// Create a new book entry
exports.createBook = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id; // Attach current user ID to the book

  const book = await Book.create(req.body);

  res.status(201).json({
    success: true,
    data: book
  });
});

// Fetch all books with optional filters, sorting, and pagination
exports.getBooks = asyncHandler(async (req, res, next) => {
  const queryParams = { ...req.query };

  // Remove special fields that shouldn't be used as filters
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(field => delete queryParams[field]);

  let query = Book.find(queryParams);

  // Field selection (e.g., ?fields=title,author)
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Handle sorting (e.g., ?sort=createdAt or ?sort=-rating,title)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort: newest first
  }

  // Pagination logic
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  query = query.skip(startIndex).limit(limit);

  // Populate user details
  const books = await query.populate({
    path: 'createdBy',
    select: 'name'
  });

  const total = await Book.countDocuments(queryParams);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    count: books.length,
    data: books
  });
});

// Get single book by ID and include its reviews with pagination
exports.getBook = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const startIndex = (page - 1) * limit;

  const book = await Book.findById(req.params.id).populate({
    path: 'createdBy',
    select: 'name'
  });

  if (!book) {
    return next(new ApiError(`Book not found with id of ${req.params.id}`, 404));
  }

  // Fetch paginated reviews for this book
  const reviews = await Review.find({ book: req.params.id })
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt')
    .populate({
      path: 'user',
      select: 'name'
    });

  const totalReviews = await Review.countDocuments({ book: req.params.id });

  // Calculate average rating for the book
  const averageRating = await Review.aggregate([
    { $match: { book: book._id } },
    { $group: { _id: null, average: { $avg: '$rating' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...book.toObject(),
      averageRating: averageRating.length > 0 ? averageRating[0].average : 0,
      reviews,
      reviewPagination: {
        total: totalReviews,
        page,
        pages: Math.ceil(totalReviews / limit),
        limit
      }
    }
  });
});

// Update a book (only allowed for the creator)
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ApiError(`Book not found with id of ${req.params.id}`, 404));
  }

  // Ensure only the user who created the book can update it
  if (book.createdBy.toString() !== req.user.id) {
    return next(new ApiError(`User ${req.user.id} is not authorized to update this book`, 403));
  }

  // Apply updates
  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: book
  });
});

// Delete a book (only allowed for the creator)
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ApiError(`Book not found with id of ${req.params.id}`, 404));
  }

  // Ensure only the user who created the book can delete it
  if (book.createdBy.toString() !== req.user.id) {
    return next(new ApiError(`User ${req.user.id} is not authorized to delete this book`, 403));
  }

  // Remove all reviews related to this book
  await Review.deleteMany({ book: req.params.id });

  // Remove the book
  await book.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Search books by title or author (partial + case-insensitive)
exports.searchBooks = asyncHandler(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ApiError('Please provide a search query', 400));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const searchRegex = new RegExp(query, 'i');

  const books = await Book.find({
    $or: [
      { title: searchRegex },
      { author: searchRegex }
    ]
  })
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt')
    .populate({
      path: 'createdBy',
      select: 'name'
    });

  const total = await Book.countDocuments({
    $or: [
      { title: searchRegex },
      { author: searchRegex }
    ]
  });

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    count: books.length,
    data: books
  });
});
