const jwt = require('jsonwebtoken');
const { UsersModel } = require('../models/sheetsModels');

/**
 * JWT Authentication Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from Google Sheets
    const user = await UsersModel.findById(decoded.id);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: 'Invalid or inactive user',
        message: 'User account not found or inactive'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      partnerId: user.partner_id,
      firstName: user.first_name,
      lastName: user.last_name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again'
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate user'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UsersModel.findById(decoded.id);
      
      if (user && user.status === 'active') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          partnerId: user.partner_id,
          firstName: user.first_name,
          lastName: user.last_name
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    console.log('Optional auth failed:', error.message);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};