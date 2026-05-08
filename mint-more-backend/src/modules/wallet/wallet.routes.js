const { Router } = require('express');
const controller = require('./wallet.controller');
const { authenticate, authorize } = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

// ── User routes ───────────────────────────────────────────────────────────────

// GET    /api/v1/wallet                          — own wallet + recent transactions
router.get('/', controller.getWallet);

// GET    /api/v1/wallet/transactions             — paginated transaction history
router.get('/transactions', controller.getTransactions);

// POST   /api/v1/wallet/withdraw                 — request withdrawal (freelancer)
router.post('/withdraw', authorize('freelancer'), controller.requestWithdrawal);

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET    /api/v1/wallet/admin/stats              — platform wallet overview
router.get('/admin/stats', authorize('admin'), controller.getAdminWalletStats);

// GET    /api/v1/wallet/admin/withdrawals         — pending withdrawal queue
router.get('/admin/withdrawals', authorize('admin'), controller.getPendingWithdrawals);

// PATCH  /api/v1/wallet/admin/withdrawals/:id    — approve or reject
router.patch('/admin/withdrawals/:withdrawalId', authorize('admin'), controller.reviewWithdrawal);

// POST   /api/v1/wallet/admin/jobs/:jobId/complete  — mark job complete + release escrow
router.post('/admin/jobs/:jobId/complete', authorize('admin'), controller.completeJob);

// POST   /api/v1/wallet/admin/jobs/:jobId/cancel   — cancel active job + refund escrow
router.post('/admin/jobs/:jobId/cancel', authorize('admin'), controller.cancelActiveJob);

// POST /api/v1/wallet/admin/users/:userId/adjust
router.post(
  '/admin/users/:userId/adjust',
  authorize('admin'),
  controller.adminAdjustWallet
);

module.exports = router;