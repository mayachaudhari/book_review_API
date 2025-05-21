const jwt = require('jsonwebtoken');
const { ApiError, asyncHandler } = require('../utils/errorHandler');
const User = require('../models/User');

const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return next(new ApiError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // .lean() optional
    if (!req.user) {
      return next(new ApiError('User not found', 404));
    }
    next();
  } catch (error) {
    return next(new ApiError('Not authorized to access this route', 401));
  }
});

/**
 * Middleware to check if the user is the owner of a resource
 */
exports.checkOwnership = (model, paramIdName, userIdField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramIdName];
    const resource = await model.findById(resourceId);

    if (!resource) {
      return next(new ApiError(`${model.modelName} with ID ${resourceId} not found`, 404));
    }

    if (!resource[userIdField] || resource[userIdField].toString() !== req.user.id) {
      return next(new ApiError('Not authorized to modify this resource', 403));
    }

    req.resource = resource;
    next();
  });
};
