const { Router } = require('express');
const controller = require('./addon.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');

const router = Router();
router.use(authenticate);

// GET  /api/v1/addons/plans
router.get('/plans', controller.getPlans);

// GET  /api/v1/addons/my
router.get('/my', controller.getMyAddons);

// POST /api/v1/addons/purchase
router.post('/purchase', authorize('client'), controller.purchaseAddon);

// GET  /api/v1/addons/check/:feature
router.get('/check/:feature', controller.checkFeature);

// Admin
router.get('/admin/plans', authorize('admin'), controller.adminGetPlans);
router.post('/admin/plans', authorize('admin'), controller.adminCreatePlan);
router.patch('/admin/plans/:planId', authorize('admin'), controller.adminUpdatePlan);
router.get('/admin/plans/:planId/subscribers', authorize('admin'), controller.adminGetSubscribers);

module.exports = router;
