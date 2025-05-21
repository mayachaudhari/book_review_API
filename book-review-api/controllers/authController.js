const User = require('../models/User');
const { ApiError, asyncHandler } = require('../utils/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/signup
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if there's already a user registered with this email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError('Email already in use', 400));
  }

  // Create a new user entry in the database
  const user = await User.create({
    name,
    email,
    password
  });

  // Generate a JWT for the new user
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

/**
 * @desc    Log in an existing user
 * @route   POST /api/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Try to find the user by email and include the password field for comparison
  const user = await User.findOne({ email }).select('+password');

  // If no user is found, send an error
  if (!user) {
    return next(new ApiError('Invalid credentials', 401));
  }

  // Compare the provided password with the stored one
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ApiError('Invalid credentials', 401));
  }

  // Password is valid — issue a token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

/**
 * @desc    Get the logged-in user's profile
 * @route   GET /api/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  // Return user info attached by auth middleware
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});
