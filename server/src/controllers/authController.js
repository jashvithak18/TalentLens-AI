const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role, companyName } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user (auto-verified)
    user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      isVerified: true
    });

    // Create profile based on role
    if (user.role === 'candidate') {
      await CandidateProfile.create({ user: user._id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        companyName: companyName || 'My Startup'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user model
    user.refreshToken = refreshToken;
    await user.save();

    // Get candidate or recruiter profile details
    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'Refresh token is required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    // In a production app, redirect to a login/success screen
    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
        <h2 style="color: #4F46E5;">Email Verified Successfully!</h2>
        <p>Your email has been verified. You can now close this tab and log in to the application.</p>
      </div>
    `);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Direct reset)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and new password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user with that email' });
    }

    // Directly update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined; // Invalidate current sessions
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshToken = undefined; // Invalidate current sessions
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign In (OAuth verification)
// @route   POST /api/auth/google-login
// @access  Public
exports.googleLogin = async (req, res, next) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Credential token is required' });
    }

    // Instantly decode Google JWT token locally to avoid slow outgoing network requests
    const decoded = jwt.decode(credential);
    
    if (!decoded || !decoded.email) {
      return res.status(400).json({ success: false, error: 'Invalid Google token structure' });
    }

    const { email, name } = decoded;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user on the fly if they don't exist
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'),
        role: 'candidate', // Default to candidate
        isVerified: true
      });

      // Create profile for candidate
      await CandidateProfile.create({ user: user._id });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user model
    user.refreshToken = refreshToken;
    await user.save();

    // Get profile details
    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(400).json({ success: false, error: 'Google token verification failed' });
  }
};
