const { query } = require('../../config/database');
const AppError  = require('../../utils/AppError');
const logger    = require('../../utils/logger');

const VALID_TYPES = ['basic', 'standard', 'premium'];

const getMyPackages = async (freelancerId) => {
	const result = await query(
		`SELECT * FROM freelancer_packages
		 WHERE freelancer_id = $1
		 ORDER BY CASE package_type
			 WHEN 'basic'    THEN 1
			 WHEN 'standard' THEN 2
			 WHEN 'premium'  THEN 3
		 END`,
		[freelancerId]
	);
	return result.rows;
};

const getFreelancerPackages = async (freelancerId) => {
	const result = await query(
		`SELECT * FROM freelancer_packages
		 WHERE freelancer_id = $1 AND is_active = true
		 ORDER BY CASE package_type
			 WHEN 'basic'    THEN 1
			 WHEN 'standard' THEN 2
			 WHEN 'premium'  THEN 3
		 END`,
		[freelancerId]
	);
	return result.rows;
};

const upsertPackage = async (freelancerId, {
	package_type, name, description, price,
	delivery_days, revisions, inclusions,
}) => {
	if (!VALID_TYPES.includes(package_type)) {
		throw new AppError(`package_type must be one of: ${VALID_TYPES.join(', ')}`, 400);
	}
	if (!name || !description || !price || !delivery_days) {
		throw new AppError('name, description, price, and delivery_days are required', 400);
	}

	const result = await query(
		`INSERT INTO freelancer_packages
			 (freelancer_id, package_type, name, description,
				price, delivery_days, revisions, inclusions)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		 ON CONFLICT (freelancer_id, package_type) DO UPDATE SET
			 name          = EXCLUDED.name,
			 description   = EXCLUDED.description,
			 price         = EXCLUDED.price,
			 delivery_days = EXCLUDED.delivery_days,
			 revisions     = EXCLUDED.revisions,
			 inclusions    = EXCLUDED.inclusions,
			 is_active     = true
		 RETURNING *`,
		[
			freelancerId, package_type, name, description,
			parseFloat(price), parseInt(delivery_days, 10),
			revisions || 'Unlimited',
			JSON.stringify(inclusions || {}),
		]
	);

	logger.info('Package upserted', { freelancerId, package_type });
	return result.rows[0];
};

const deletePackage = async (freelancerId, packageType) => {
	const result = await query(
		`UPDATE freelancer_packages
		 SET is_active = false
		 WHERE freelancer_id = $1 AND package_type = $2
		 RETURNING *`,
		[freelancerId, packageType]
	);
	if (!result.rows[0]) throw new AppError('Package not found', 404);
	return result.rows[0];
};

module.exports = {
	getMyPackages,
	getFreelancerPackages,
	upsertPackage,
	deletePackage,
};
