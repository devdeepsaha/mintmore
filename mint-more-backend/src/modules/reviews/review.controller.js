const reviewService = require('./review.service');
const { sendSuccess } = require('../../utils/apiResponse');

const submitReview = async (req, res, next) => {
	try {
		const review = await reviewService.submitReview(req.user.sub, req.body);
		return sendSuccess(res, {
			data: { review }, message: 'Review submitted', statusCode: 201,
		});
	} catch (err) { next(err); }
};

const getFreelancerReviews = async (req, res, next) => {
	try {
		const { page, limit, sort } = req.query;
		const result = await reviewService.getFreelancerReviews(
			req.params.freelancerId,
			{ page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 10, sort }
		);
		return sendSuccess(res, { data: result });
	} catch (err) { next(err); }
};

module.exports = { submitReview, getFreelancerReviews };
