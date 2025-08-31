const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('../services/authService');

const router = express.Router();

// Initialize Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleUser = {
      sub: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      given_name: profile.name.givenName,
      family_name: profile.name.familyName,
      picture: profile.photos[0].value
    };

    const result = await authService.googleLogin(googleUser);
    return done(null, result);
  } catch (error) {
    return done(error, null);
  }
}));

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, partnerCompany, territory } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName']
      });
    }

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      partnerCompany,
      territory
    });

    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/auth/login/email
 * @desc Login with email (existing endpoint)
 */
router.post('/login/email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const user = await authService.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const accessToken = authService.generateToken(user);
    
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      partnerId: user.partner_company,
      partnerName: user.partner_company
    };

    res.json({
      message: 'Login successful',
      user: userData,
      accessToken: accessToken
    });

  } catch (error) {
    console.error('Email login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

/**
 * @route POST /api/v1/auth/login
 * @desc Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const result = await authService.loginUser(email, password);

    res.json({
      message: 'Login successful',
      ...result
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/auth/google
 * @desc Start Google OAuth flow
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route GET /api/v1/auth/google/callback
 * @desc Google OAuth callback with admin check - PRODUCTION READY
 */
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const { user, accessToken } = req.user;
      
      // Import the checkAdminStatus function
      const { checkAdminStatus } = require('../middleware/auth');
      
      // Check if user should be admin based on Admins sheet
      const isAdmin = await checkAdminStatus(user.email);
      
      // Override role based on Admins sheet check
      const updatedUser = {
        ...user,
        role: isAdmin ? 'admin' : user.role || 'user'
      };
      
      // Use environment variable for frontend URL - PRODUCTION READY
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
      console.log('OAuth Redirect - Frontend URL:', frontendURL);
      
      const redirectUrl = `${frontendURL}/auth/callback?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(updatedUser))}`;
      console.log('Final redirect URL:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
      res.redirect(`${frontendURL}/auth?error=google_auth_failed`);
    }
  }
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user info (requires auth middleware)
 */
router.get('/me', (req, res) => {
  res.json({
    message: 'Auth middleware not implemented yet',
    note: 'This will return current user info after implementing auth middleware'
  });
});

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 */
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Clear the token on frontend'
  });
});

module.exports = router;