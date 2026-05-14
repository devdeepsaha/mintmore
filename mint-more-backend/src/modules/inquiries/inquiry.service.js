const { query } = require('../../config/database');
const AppError  = require('../../utils/AppError');
const logger    = require('../../utils/logger');

const sendInquiry = async (clientId, {
	freelancer_id, package_id, message, budget, deadline_days,
}) => {
	if (!message || message.trim().length < 10) {
		throw new AppError('message is required (min 10 characters)', 400);
	}

	const fResult = await query(
		'SELECT id, marketplace_visible FROM users WHERE id = $1 AND role = $2',
		[freelancer_id, 'freelancer']
	);
	if (!fResult.rows[0]?.marketplace_visible) {
		throw new AppError('Freelancer not found', 404);
	}

	const result = await query(
		`INSERT INTO direct_inquiries
			 (client_id, freelancer_id, package_id, message, budget, deadline_days)
		 VALUES ($1,$2,$3,$4,$5,$6)
		 RETURNING *`,
		[
			clientId, freelancer_id,
			package_id || null,
			message.trim(),
			budget ? parseFloat(budget) : null,
			deadline_days ? parseInt(deadline_days, 10) : null,
		]
	);

	logger.info('Direct inquiry sent', { clientId, freelancer_id });
	return result.rows[0];
};

const getMyInquiries = async (userId, role) => {
	const field = role === 'client' ? 'client_id' : 'freelancer_id';
	const result = await query(
		`SELECT
			 di.*,
			 u_c.full_name  AS client_name,
			 u_c.avatar_url AS client_avatar,
			 u_f.full_name  AS freelancer_name,
			 u_f.avatar_url AS freelancer_avatar,
			 fp.name        AS package_name,
			 fp.price       AS package_price
		 FROM direct_inquiries di
		 JOIN users u_c ON u_c.id = di.client_id
		 JOIN users u_f ON u_f.id = di.freelancer_id
		 LEFT JOIN freelancer_packages fp ON fp.id = di.package_id
		 WHERE di.${field} = $1
		 ORDER BY di.created_at DESC`,
		[userId]
	);
	return result.rows;
};

const respondToInquiry = async (freelancerId, inquiryId, { response, action }) => {
	if (!['accept', 'decline'].includes(action)) {
		throw new AppError('action must be accept or decline', 400);
	}

	const result = await query(
		`UPDATE direct_inquiries
		 SET status              = $1,
				 freelancer_response = $2,
				 responded_at        = NOW()
		 WHERE id = $3 AND freelancer_id = $4 AND status = 'pending'
		 RETURNING *`,
		[
			action === 'accept' ? 'responded' : 'declined',
			response || null,
			inquiryId, freelancerId,
		]
	);

	if (!result.rows[0]) throw new AppError('Inquiry not found or already responded', 404);
	return result.rows[0];
};

module.exports = { sendInquiry, getMyInquiries, respondToInquiry };
