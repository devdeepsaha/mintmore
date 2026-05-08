const proposalService = require('./proposal.service');
const {
  validateSubmitProposal,
  validateAdminReviewProposal,
} = require('./proposal.validator');
const { sendSuccess } = require('../../utils/apiResponse');

const submitProposal = async (req, res, next) => {
  try {
    validateSubmitProposal(req.body);
    const proposal = await proposalService.submitProposal(
      req.user.sub, req.params.jobId, req.body
    );
    return sendSuccess(res, {
      data: { proposal },
      message: 'Proposal submitted successfully',
      statusCode: 201,
    });
  } catch (err) { next(err); }
};

const withdrawProposal = async (req, res, next) => {
  try {
    const result = await proposalService.withdrawProposal(
      req.params.proposalId, req.user.sub
    );
    return sendSuccess(res, { message: result.message });
  } catch (err) { next(err); }
};

const getMyProposals = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await proposalService.getMyProposals(req.user.sub, {
      page:  parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      status,
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const getJobProposalsForClient = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await proposalService.getJobProposalsForClient(
      req.params.jobId, req.user.sub, {
        page:  parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      }
    );
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const adminGetJobProposals = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await proposalService.adminGetJobProposals(req.params.jobId, {
      page:  parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50,
      status,
    });
    return sendSuccess(res, { data: result });
  } catch (err) { next(err); }
};

const adminReviewProposal = async (req, res, next) => {
  try {
    validateAdminReviewProposal(req.body);
    const proposal = await proposalService.adminReviewProposal(
      req.params.proposalId, req.user.sub, req.body
    );
    return sendSuccess(res, {
      data: { proposal },
      message: `Proposal ${req.body.status}`,
    });
  } catch (err) { next(err); }
};

module.exports = {
  submitProposal,
  withdrawProposal,
  getMyProposals,
  getJobProposalsForClient,
  adminGetJobProposals,
  adminReviewProposal,
};