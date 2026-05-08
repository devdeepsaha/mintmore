const negotiationService = require('./negotiation.service');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

// ── Freelancer ────────────────────────────────────────────────────────────────

const initiateNegotiation = async (req, res, next) => {
  try {
    const { proposed_price, proposed_days, message } = req.body;
    if (!proposed_price) {
      throw new AppError('proposed_price is required', 400);
    }
    if (parseFloat(proposed_price) <= 0) {
      throw new AppError('proposed_price must be a positive number', 400);
    }

    const result = await negotiationService.initiateNegotiation(
      req.user.sub,
      req.params.jobId,
      { proposed_price: parseFloat(proposed_price), proposed_days, message }
    );

    return sendSuccess(res, {
      data:       result,
      message:    'Negotiation initiated. Job is now locked for you.',
      statusCode: 201,
    });
  } catch (err) { next(err); }
};

const freelancerRespond = async (req, res, next) => {
  try {
    const { action, proposed_price, proposed_days, message } = req.body;

    const result = await negotiationService.freelancerRespond(
      req.user.sub,
      req.params.jobId,
      {
        action,
        proposed_price: proposed_price ? parseFloat(proposed_price) : undefined,
        proposed_days,
        message,
      }
    );

    return sendSuccess(res, { data: result, message: `Negotiation action: ${action}` });
  } catch (err) { next(err); }
};

const respondToAssignment = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      throw new AppError('action must be accept or decline', 400);
    }

    const result = await negotiationService.respondToAssignment(
      req.user.sub,
      req.params.jobId,
      { action, note }
    );

    return sendSuccess(res, {
      data:    result,
      message: action === 'accept' ? 'Assignment accepted. Job is now in progress.' : 'Assignment declined.',
    });
  } catch (err) { next(err); }
};

// ── Client ────────────────────────────────────────────────────────────────────

const clientRespond = async (req, res, next) => {
  try {
    const { action, proposed_price, proposed_days, message } = req.body;

    const result = await negotiationService.clientRespond(
      req.user.sub,
      req.params.jobId,
      {
        action,
        proposed_price: proposed_price ? parseFloat(proposed_price) : undefined,
        proposed_days,
        message,
      }
    );

    return sendSuccess(res, { data: result, message: `Negotiation action: ${action}` });
  } catch (err) { next(err); }
};

// ── Shared ────────────────────────────────────────────────────────────────────

const getNegotiationStatus = async (req, res, next) => {
  try {
    const result = await negotiationService.getNegotiationStatus(
      req.params.jobId,
      req.user.sub,
      req.user.role
    );
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

const adminApproveDeal = async (req, res, next) => {
  try {
    const result = await negotiationService.adminApproveDeal(
      req.params.jobId,
      req.user.sub,
      { admin_note: req.body.admin_note }
    );

    return sendSuccess(res, {
      data:    result,
      message: 'Deal approved. Assignment created. Awaiting freelancer acceptance.',
    });
  } catch (err) { next(err); }
};

const adminRejectDeal = async (req, res, next) => {
  try {
    const result = await negotiationService.adminRejectDeal(
      req.params.jobId,
      req.user.sub,
      { admin_note: req.body.admin_note }
    );

    return sendSuccess(res, { data: result, message: 'Deal rejected. Fallback triggered.' });
  } catch (err) { next(err); }
};

const getAdminPendingApprovals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await negotiationService.getAdminPendingApprovals({
      page:  parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

module.exports = {
  initiateNegotiation,
  freelancerRespond,
  respondToAssignment,
  clientRespond,
  getNegotiationStatus,
  adminApproveDeal,
  adminRejectDeal,
  getAdminPendingApprovals,
};