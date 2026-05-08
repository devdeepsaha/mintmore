const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Global rate limiter — applied to all /api routes.
 * Phase 2 will add tighter per-route limiters for auth endpoints.
 */
const globalRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs, // default: 15 minutes
  max: env.security.rateLimitMax,           // default: 100 requests / window
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, {
      statusCode: 429,
      message: 'Too many requests. Please slow down and try again later.',
    });
  },
});

module.exports = { globalRateLimiter };