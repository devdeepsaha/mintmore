const walletService = require('./wallet.service');
const {
  validateTopUp,
  validateWithdrawal,
  validateAdminWithdrawalReview,
} = require('./wallet.validator');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

const getWallet = async (req, res, next) => {
  try {
    const result = await walletService.getWallet(req.user.sub);
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, type } = req.query;
    const result = await walletService.getTransactions(req.user.sub, {
      page:  parseInt(page, 10)  || 1,
      limit: parseInt(limit, 10) || 20,
      type,
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const requestWithdrawal = async (req, res, next) => {
  try {
    validateWithdrawal(req.body);
    const withdrawal = await walletService.requestWithdrawal(req.user.sub, req.body);
    return sendSuccess(res, {
      data:       { withdrawal },
      message:    'Withdrawal request submitted. Admin will review within 2 business days.',
      statusCode: 201,
    });
  } catch (err) { next(err); }
};

// Admin controllers
const getPendingWithdrawals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await walletService.getPendingWithdrawals({
      page:  parseInt(page, 10)  || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const reviewWithdrawal = async (req, res, next) => {
  try {
    validateAdminWithdrawalReview(req.body);
    const withdrawal = await walletService.reviewWithdrawal(
      req.params.withdrawalId,
      req.user.sub,
      req.body
    );
    return sendSuccess(res, {
      data:    { withdrawal },
      message: `Withdrawal ${req.body.action === 'approve' ? 'approved' : 'rejected'}`,
    });
  } catch (err) { next(err); }
};

const completeJob = async (req, res, next) => {
  try {
    const result = await walletService.completeJob(
      req.params.jobId,
      req.user.sub,
      { completion_note: req.body.completion_note }
    );
    return sendSuccess(res, {
      data:    result,
      message: 'Job marked as complete. Escrow released to freelancer.',
    });
  } catch (err) { next(err); }
};

const cancelActiveJob = async (req, res, next) => {
  try {
    const result = await walletService.cancelActiveJob(
      req.params.jobId,
      req.user.sub,
      { cancel_reason: req.body.cancel_reason }
    );
    return sendSuccess(res, {
      data:    result,
      message: 'Job cancelled. Escrow refunded to client.',
    });
  } catch (err) { next(err); }
};

const getAdminWalletStats = async (req, res, next) => {
  try {
    const stats = await walletService.getAdminWalletStats();
    return sendSuccess(res, { data: { stats } });
  } catch (err) { next(err); }
};

const adminAdjustWallet = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const result = await walletService.adminAdjustWallet(
      req.params.userId,
      req.user.sub,
      { amount: parseFloat(amount), note }
    );
    return sendSuccess(res, {
      data:    result,
      message: `Wallet adjusted by ₹${Math.abs(amount).toLocaleString('en-IN')} (${parseFloat(amount) > 0 ? 'credit' : 'debit'})`,
    });
  } catch (err) { next(err); }
};

module.exports = {
  getWallet,
  getTransactions,
  requestWithdrawal,
  getPendingWithdrawals,
  reviewWithdrawal,
  completeJob,
  cancelActiveJob,
  getAdminWalletStats,
  adminAdjustWallet,
};