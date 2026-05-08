const AppError = require('../utils/AppError');
const { query } = require('../config/database');

/**
 * requireApproved middleware
 *
 * Enforces that a user has been platform-approved by an admin
 * before they can perform marketplace actions:
 *  - Clients   → post jobs
 *  - Freelancers → submit proposals, accept assignments
 *
 * Must be used AFTER authenticate middleware.
 *
 * Usage:
 *   router.post('/jobs', authenticate, requireApproved, controller.create)
 */
const requireApproved = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT is_approved, is_active, role FROM users WHERE id = $1',
      [req.user.sub]
    );

    const user = result.rows[0];

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.is_active) {
      return next(new AppError('Your account has been deactivated', 403));
    }

    if (!user.is_approved) {
      return next(
        new AppError(
          'Your account is pending admin approval. You will be notified once approved.',
          403
        )
      );
    }

    // Attach full role to request for downstream use
    req.userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireFreelancerLevel — enforces minimum freelancer level for a job.
 * Used when a freelancer tries to submit a proposal.
 *
 * @param {string} requiredLevel - 'beginner' | 'intermediate' | 'experienced'
 */
const LEVEL_ORDER = { beginner: 1, intermediate: 2, experienced: 3 };

const requireFreelancerLevel = (requiredLevel) => async (req, res, next) => {
  try {
    if (!requiredLevel) return next(); // no level restriction

    const result = await query(
      'SELECT freelancer_level FROM users WHERE id = $1',
      [req.user.sub]
    );

    const userLevel = result.rows[0]?.freelancer_level;

    if (!userLevel) {
      return next(
        new AppError('Your freelancer level has not been set by an admin yet.', 403)
      );
    }

    if (LEVEL_ORDER[userLevel] < LEVEL_ORDER[requiredLevel]) {
      return next(
        new AppError(
          `This job requires ${requiredLevel} level or above. Your current level: ${userLevel}.`,
          403
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireApproved, requireFreelancerLevel };