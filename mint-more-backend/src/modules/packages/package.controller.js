const packageService = require('./package.service');
const { sendSuccess } = require('../../utils/apiResponse');

const getMyPackages = async (req, res, next) => {
	try {
		const packages = await packageService.getMyPackages(req.user.sub);
		return sendSuccess(res, { data: { packages } });
	} catch (err) { next(err); }
};

const upsertPackage = async (req, res, next) => {
	try {
		const pkg = await packageService.upsertPackage(req.user.sub, req.body);
		return sendSuccess(res, {
			data:    { package: pkg },
			message: `${pkg.package_type} package saved`,
		});
	} catch (err) { next(err); }
};

const deletePackage = async (req, res, next) => {
	try {
		await packageService.deletePackage(req.user.sub, req.params.packageType);
		return sendSuccess(res, { message: 'Package removed' });
	} catch (err) { next(err); }
};

module.exports = { getMyPackages, upsertPackage, deletePackage };
