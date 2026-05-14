const { Router } = require('express');
const controller = require('./inquiry.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');
const { requireAddon } = require('../../middleware/requireAddon');

const router = Router();
router.use(authenticate);

router.post('/',
	authorize('client'),
	requireAddon('direct_inquiry'),
	controller.sendInquiry
);

router.get('/', controller.getMyInquiries);

router.patch('/:inquiryId/respond',
	authorize('freelancer'),
	controller.respondToInquiry
);

module.exports = router;
