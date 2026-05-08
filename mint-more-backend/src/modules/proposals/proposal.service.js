const { query, getClient } = require('../../config/database');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

// ── Freelancer Actions ────────────────────────────────────────────────────────

/**
 * Submit a proposal on an open job.
 * Enforces:
 *  - Job must be open
 *  - Freelancer must be approved
 *  - No duplicate proposals
 *  - Freelancer level must meet job requirement
 */
const submitProposal = async (freelancerId, jobId, data) => {
  // 1. Fetch job and validate it's open
  const jobResult = await query(
    `SELECT id, status, client_id, required_level, budget_type, budget_amount
     FROM jobs WHERE id = $1`,
    [jobId]
  );

  const job = jobResult.rows[0];
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== 'open') {
    throw new AppError('This job is no longer accepting proposals', 400);
  }

  // 2. Prevent client from proposing on their own job
  if (job.client_id === freelancerId) {
    throw new AppError('You cannot submit a proposal on your own job', 400);
  }

  // 3. Fetch freelancer and validate level requirement
  const freelancerResult = await query(
    `SELECT id, is_approved, is_available, freelancer_level, role
     FROM users WHERE id = $1`,
    [freelancerId]
  );

  const freelancer = freelancerResult.rows[0];
  if (!freelancer) throw new AppError('User not found', 404);
  if (freelancer.role !== 'freelancer') {
    throw new AppError('Only freelancers can submit proposals', 403);
  }
  if (!freelancer.is_approved) {
    throw new AppError('Your account is pending admin approval', 403);
  }
  if (!freelancer.is_available) {
    throw new AppError(
      'You are currently marked as unavailable. Update your availability in your profile.',
      400
    );
  }

  // 4. Check level requirement
  const LEVEL_ORDER = { beginner: 1, intermediate: 2, experienced: 3 };
  if (job.required_level && freelancer.freelancer_level) {
    if (LEVEL_ORDER[freelancer.freelancer_level] < LEVEL_ORDER[job.required_level]) {
      throw new AppError(
        `This job requires ${job.required_level} level or above. Your level: ${freelancer.freelancer_level}`,
        403
      );
    }
  }

  if (job.required_level && !freelancer.freelancer_level) {
    throw new AppError(
      'Your freelancer level has not been set yet. Contact support.',
      403
    );
  }

  // 5. Check for duplicate proposal
  const duplicate = await query(
    'SELECT id FROM proposals WHERE job_id = $1 AND freelancer_id = $2',
    [jobId, freelancerId]
  );
  if (duplicate.rows[0]) {
    throw new AppError('You have already submitted a proposal for this job', 409);
  }

  // 6. Insert proposal
  const result = await query(
    `INSERT INTO proposals
       (job_id, freelancer_id, cover_letter, proposed_amount, proposed_days)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      jobId,
      freelancerId,
      data.cover_letter.trim(),
      data.proposed_amount ? parseFloat(data.proposed_amount) : null,
      data.proposed_days  ? parseInt(data.proposed_days, 10) : null,
    ]
  );

  logger.info('Proposal submitted', { freelancerId, jobId });
  return result.rows[0];
};

/**
 * Withdraw a pending proposal (freelancer only).
 * Cannot withdraw shortlisted or accepted proposals.
 */
const withdrawProposal = async (proposalId, freelancerId) => {
  const result = await query(
    `SELECT * FROM proposals WHERE id = $1 AND freelancer_id = $2`,
    [proposalId, freelancerId]
  );

  const proposal = result.rows[0];
  if (!proposal) throw new AppError('Proposal not found', 404);

  if (!['pending'].includes(proposal.status)) {
    throw new AppError(
      `Cannot withdraw a proposal that is already ${proposal.status}`,
      400
    );
  }

  await query('DELETE FROM proposals WHERE id = $1', [proposalId]);

  logger.info('Proposal withdrawn', { proposalId, freelancerId });
  return { message: 'Proposal withdrawn successfully' };
};

/**
 * Get all proposals submitted by the logged-in freelancer.
 */
const getMyProposals = async (freelancerId, { page = 1, limit = 20, status } = {}) => {
  const offset = (page - 1) * limit;
  const params = [freelancerId];
  let statusClause = '';

  if (status) {
    params.push(status);
    statusClause = `AND p.status = $${params.length}`;
  }

  params.push(limit, offset);

  const result = await query(
    `SELECT
       p.id, p.status, p.cover_letter,
       p.proposed_amount, p.proposed_days,
       p.admin_note, p.created_at,
       j.id AS job_id, j.title AS job_title,
       j.status AS job_status,
       j.budget_type, j.budget_amount,
       c.name AS category_name
     FROM proposals p
     JOIN jobs j ON j.id = p.job_id
     LEFT JOIN categories c ON c.id = j.category_id
     WHERE p.freelancer_id = $1 ${statusClause}
     ORDER BY p.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM proposals p WHERE p.freelancer_id = $1 ${statusClause}`,
    params.slice(0, -2)
  );

  return {
    proposals: result.rows,
    pagination: {
      page, limit,
      total: parseInt(countResult.rows[0].count, 10),
      pages: Math.ceil(countResult.rows[0].count / limit),
    },
  };
};

// ── Client Actions ────────────────────────────────────────────────────────────

/**
 * Client views proposals on their own job.
 * Only returns shortlisted proposals — full list is admin only.
 */
const getJobProposalsForClient = async (jobId, clientId, { page = 1, limit = 20 } = {}) => {
  // Verify ownership
  const jobResult = await query(
    'SELECT id, client_id, status FROM jobs WHERE id = $1',
    [jobId]
  );

  const job = jobResult.rows[0];
  if (!job) throw new AppError('Job not found', 404);
  if (job.client_id !== clientId) {
    throw new AppError('You do not own this job', 403);
  }

  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT
       p.id, p.status, p.cover_letter,
       p.proposed_amount, p.proposed_days,
       p.created_at,
       u.id AS freelancer_id,
       u.full_name, u.avatar_url,
       u.freelancer_level, u.average_rating,
       u.jobs_completed_count, u.bio,
       u.skills
     FROM proposals p
     JOIN users u ON u.id = p.freelancer_id
     WHERE p.job_id = $1
       AND p.status IN ('shortlisted', 'accepted')
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [jobId, limit, offset]
  );

  return { proposals: result.rows };
};

// ── Admin Actions ─────────────────────────────────────────────────────────────

/**
 * Admin views ALL proposals for a job (all statuses).
 */
const adminGetJobProposals = async (jobId, { page = 1, limit = 50, status } = {}) => {
  const offset = (page - 1) * limit;
  const params = [jobId];
  let statusClause = '';

  if (status) {
    params.push(status);
    statusClause = `AND p.status = $${params.length}`;
  }

  params.push(limit, offset);

  const result = await query(
    `SELECT
       p.*,
       u.full_name, u.email, u.avatar_url,
       u.freelancer_level, u.average_rating,
       u.jobs_completed_count, u.is_available,
       u.skills, u.bio,
       u.kyc_status, u.kyc_level
     FROM proposals p
     JOIN users u ON u.id = p.freelancer_id
     WHERE p.job_id = $1 ${statusClause}
     ORDER BY
       CASE p.status
         WHEN 'shortlisted' THEN 1
         WHEN 'pending'     THEN 2
         WHEN 'rejected'    THEN 3
         WHEN 'accepted'    THEN 4
       END,
       p.created_at ASC`,
    params
  );

  const countResult = await query(
    `SELECT COUNT(*) FROM proposals WHERE job_id = $1 ${statusClause}`,
    params.slice(0, -2)
  );

  return {
    proposals: result.rows,
    pagination: {
      page, limit,
      total: parseInt(countResult.rows[0].count, 10),
      pages: Math.ceil(countResult.rows[0].count / limit),
    },
  };
};

/**
 * Admin shortlists or rejects a proposal.
 */
const adminReviewProposal = async (proposalId, adminId, { status, admin_note }) => {
  const result = await query(
    `UPDATE proposals
     SET status      = $1,
         admin_note  = $2,
         reviewed_by = $3,
         reviewed_at = NOW()
     WHERE id = $4
       AND status = 'pending'
     RETURNING *`,
    [status, admin_note || null, adminId, proposalId]
  );

  if (!result.rows[0]) {
    throw new AppError('Proposal not found or already reviewed', 404);
  }

  logger.info('Proposal reviewed by admin', { proposalId, adminId, status });
  return result.rows[0];
};

module.exports = {
  submitProposal,
  withdrawProposal,
  getMyProposals,
  getJobProposalsForClient,
  adminGetJobProposals,
  adminReviewProposal,
};