const inquiryService = require('./inquiry.service');
const { sendSuccess } = require('../../utils/apiResponse');

const sendInquiry = async (req, res, next) => {
	try {
		const inquiry = await inquiryService.sendInquiry(req.user.sub, req.body);
		return sendSuccess(res, {
			data: { inquiry }, message: 'Inquiry sent to freelancer', statusCode: 201,
		});
	} catch (err) { next(err); }
};

const getMyInquiries = async (req, res, next) => {
	try {
		const inquiries = await inquiryService.getMyInquiries(req.user.sub, req.user.role);
		return sendSuccess(res, { data: { inquiries } });
	} catch (err) { next(err); }
};

const respondToInquiry = async (req, res, next) => {
	try {
		const inquiry = await inquiryService.respondToInquiry(
			req.user.sub, req.params.inquiryId, req.body
		);
		return sendSuccess(res, { data: { inquiry }, message: `Inquiry ${req.body.action}ed` });
	} catch (err) { next(err); }
};

module.exports = { sendInquiry, getMyInquiries, respondToInquiry };
