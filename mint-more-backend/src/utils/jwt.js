const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./AppError');

/**
 * Sign a short-lived access token (default 15m).
 * Payload contains minimal user info — never put sensitive data in JWT.
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
    issuer: 'mint-more',
    audience: 'mint-more-client',
  });
};

/**
 * Sign a long-lived refresh token (default 7d).
 * Stored in DB — allows us to invalidate all sessions for a user.
 */
const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
    issuer: 'mint-more',
    audience: 'mint-more-client',
  });
};

/**
 * Verify access token — throws AppError on failure.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.accessSecret, {
      issuer: 'mint-more',
      audience: 'mint-more-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Invalid access token', 401);
  }
};

/**
 * Verify refresh token — throws AppError on failure.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret, {
      issuer: 'mint-more',
      audience: 'mint-more-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired. Please log in again.', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};