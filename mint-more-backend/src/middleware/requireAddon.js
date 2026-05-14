const { query } = require('../config/database');
const AppError  = require('../utils/AppError');

/**
 * requireAddon middleware factory.
 *
 * Checks that the requesting user has an active (non-expired) addon
 * that includes the specified feature.
 *
 * Usage:
 *   router.get('/freelancers', authenticate, requireAddon('browse_freelancers'), controller)
 *
 * @param {string} feature - addon_feature enum value required
 */
const requireAddon = (feature) => async (req, res, next) => {
	try {
		const result = await query(
			`SELECT ca.id, ca.expires_at, ca.features
			 FROM client_addons ca
			 WHERE ca.user_id   = $1
				 AND ca.is_active = true
				 AND ca.expires_at > NOW()
				 AND $2 = ANY(ca.features)
			 ORDER BY ca.expires_at DESC
			 LIMIT 1`,
			[req.user.sub, feature]
		);

		if (!result.rows[0]) {
			return next(
				new AppError(
					'This feature requires the Browse Add-on plan. Purchase a plan from your dashboard to unlock freelancer browsing.',
					403
				)
			);
		}

		req.addon = result.rows[0];
		next();
	} catch (err) {
		next(err);
	}
};

module.exports = { requireAddon };
