const { Router } = require('express');
const controller = require('./package.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');

const router = Router();
router.use(authenticate, authorize('freelancer'));

router.get('/', controller.getMyPackages);
router.put('/', controller.upsertPackage);
router.delete('/:packageType', controller.deletePackage);

module.exports = router;
