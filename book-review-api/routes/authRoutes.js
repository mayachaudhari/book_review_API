const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validation');

// Public routes
router.post('/signup', validationRules.register, validate, register);
router.post('/login', validationRules.login, validate, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;