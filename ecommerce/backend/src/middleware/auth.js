// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes - verify token and attach user to request
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user (without password) to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    if (user.isBlocked) {
      res.status(403);
      throw new Error('User account is blocked. Please contact support.');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode === 403) {
      res.status(403);
      throw error;
    }
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

// Admin role verification middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Optional protect middleware - extracts user if token exists, but doesn't throw if not
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user && !user.isBlocked) {
      req.user = user;
    }
    next();
  } catch (error) {
    next(); // Ignore errors and just proceed
  }
});

module.exports = { protect, admin, optionalProtect };
