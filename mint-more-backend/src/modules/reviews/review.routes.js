const { Router } = require('express');
const controller = require('./review.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');

const router = Router();
router.use(authenticate);

router.post('/', authorize('client'), controller.submitReview);

router.get('/freelancer/:freelancerId', controller.getFreelancerReviews);

module.exports = router;
