const notificationService = require('./notification.service');

/**
 * All notification trigger functions.
 *
 * Rules:
 * - Every function is fire-and-forget (async, errors logged not thrown)
 * - Called from other service files AFTER their DB transaction commits
 * - Never imported inside a transaction — always post-commit
 */

// ── Matching ──────────────────────────────────────────────────────────────────

/**
 * Notify matched freelancers after matching engine runs.
 * Each freelancer gets their own notification with their rank and notify_at.
 *
 * @param {object}   job       - job row
 * @param {object[]} candidates - ranked candidates array from matching engine
 */
const notifyMatchedCandidates = async (job, candidates) => {
  if (!candidates || candidates.length === 0) return;

  const notifications = candidates.map((candidate) => ({
    userId:     candidate.freelancer_id,
    type:       'job_matched',
    title:      '🎯 New Job Match',
    body:       `You have been matched to "${job.title}". You are ranked #${candidate.rank}. Check your dashboard to respond.`,
    entityType: 'job',
    entityId:   job.id,
    data: {
      job_id:          job.id,
      job_title:       job.title,
      rank:            candidate.rank,
      tier:            candidate.tier,
      notify_at:       candidate.notify_at,
      score:           candidate.score,
      pricing_mode:    job.pricing_mode,
    },
  }));

  await notificationService.createBulkNotifications(notifications);
};

// ── Negotiation ───────────────────────────────────────────────────────────────

/**
 * Freelancer initiated negotiation → notify client.
 */
const notifyNegotiationInitiated = async ({ job, freelancer, proposed_price }) => {
  await notificationService.createNotification({
    userId:     job.client_id,
    type:       'negotiation_initiated',
    title:      '💬 Freelancer Started Negotiation',
    body:       `${freelancer.full_name} has initiated a negotiation on "${job.title}" with a proposed price of ₹${Number(proposed_price).toLocaleString('en-IN')}.`,
    entityType: 'job',
    entityId:   job.id,
    data: {
      job_id:         job.id,
      job_title:      job.title,
      freelancer_id:  freelancer.id,
      freelancer_name: freelancer.full_name,
      proposed_price,
    },
  });
};

/**
 * Either party countered → notify the other party.
 */
const notifyNegotiationCountered = async ({
  job,
  senderName,
  recipientUserId,
  round_number,
  proposed_price,
}) => {
  await notificationService.createNotification({
    userId:     recipientUserId,
    type:       'negotiation_countered',
    title:      '🔄 Counter Offer Received',
    body:       `${senderName} has countered with ₹${Number(proposed_price).toLocaleString('en-IN')} (Round ${round_number} of 2) on "${job.title}".`,
    entityType: 'job',
    entityId:   job.id,
    data: {
      job_id:         job.id,
      job_title:      job.title,
      sender_name:    senderName,
      round_number,
      proposed_price,
    },
  });
};

/**
 * Either party accepted → notify both.
 */
const notifyNegotiationAccepted = async ({
  job,
  freelancerUserId,
  clientUserId,
  agreed_price,
  accepted_by,   // 'freelancer' | 'client'
}) => {
  const accepterLabel = accepted_by === 'freelancer' ? 'Freelancer' : 'Client';

  await notificationService.createBulkNotifications([
    {
      userId:     freelancerUserId,
      type:       'negotiation_accepted',
      title:      '✅ Deal Agreed — Awaiting Admin Approval',
      body:       `Your negotiation on "${job.title}" has been agreed at ₹${Number(agreed_price).toLocaleString('en-IN')}. An admin will review shortly.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, agreed_price, accepted_by },
    },
    {
      userId:     clientUserId,
      type:       'negotiation_accepted',
      title:      '✅ Deal Agreed — Awaiting Admin Approval',
      body:       `${accepterLabel} has accepted the deal on "${job.title}" at ₹${Number(agreed_price).toLocaleString('en-IN')}. An admin will review shortly.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, agreed_price, accepted_by },
    },
  ]);
};

/**
 * Either party rejected → notify both.
 */
const notifyNegotiationRejected = async ({
  job,
  freelancerUserId,
  clientUserId,
  rejected_by,   // 'freelancer' | 'client'
  fallback,
}) => {
  const rejecterLabel = rejected_by === 'freelancer' ? 'Freelancer' : 'Client';
  const fallbackMsg   = fallback?.action === 're_matching'
    ? 'The job has been sent back for re-matching.'
    : 'The next candidate has been notified.';

  await notificationService.createBulkNotifications([
    {
      userId:     freelancerUserId,
      type:       'negotiation_rejected',
      title:      '❌ Negotiation Ended',
      body:       `The negotiation on "${job.title}" was rejected by the ${rejecterLabel}. ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, rejected_by, fallback },
    },
    {
      userId:     clientUserId,
      type:       'negotiation_rejected',
      title:      '❌ Negotiation Ended',
      body:       `The negotiation on "${job.title}" was rejected by the ${rejecterLabel}. ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, rejected_by, fallback },
    },
  ]);
};

/**
 * Deal agreed → notify admin(s) for approval.
 */
const notifyAdminDealPending = async ({ job, agreedPrice, agreedDays }) => {
  const admins = await require('../../config/database').query(
    `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
  );

  if (!admins.rows.length) return;

  const notifications = admins.rows.map((admin) => ({
    userId:     admin.id,
    type:       'deal_pending_admin',
    title:      '⏳ Deal Awaiting Your Approval',
    body:       `A deal has been agreed on "${job.title}" for ₹${Number(agreedPrice).toLocaleString('en-IN')}${agreedDays ? ` in ${agreedDays} days` : ''}. Please review and approve.`,
    entityType: 'job',
    entityId:   job.id,
    data:       { job_id: job.id, job_title: job.title, agreed_price: agreedPrice, agreed_days: agreedDays },
  }));

  await notificationService.createBulkNotifications(notifications);
};

/**
 * Admin approved deal → notify freelancer + client.
 */
const notifyDealApproved = async ({ job, freelancerUserId, clientUserId, agreedPrice }) => {
  await notificationService.createBulkNotifications([
    {
      userId:     freelancerUserId,
      type:       'deal_approved',
      title:      '🎉 Deal Approved — Accept Your Assignment',
      body:       `An admin has approved your deal on "${job.title}" for ₹${Number(agreedPrice).toLocaleString('en-IN')}. Please accept your assignment to get started.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, agreed_price: agreedPrice },
    },
    {
      userId:     clientUserId,
      type:       'deal_approved',
      title:      '🎉 Deal Approved',
      body:       `An admin has approved the deal on "${job.title}" for ₹${Number(agreedPrice).toLocaleString('en-IN')}. The freelancer has been notified to accept.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, agreed_price: agreedPrice },
    },
  ]);
};

/**
 * Admin rejected deal → notify freelancer + client.
 */
const notifyDealRejectedByAdmin = async ({
  job,
  freelancerUserId,
  clientUserId,
  adminNote,
  fallback,
}) => {
  const fallbackMsg = fallback?.action === 're_matching'
    ? 'The job has been sent back for re-matching.'
    : 'The next candidate has been notified.';

  await notificationService.createBulkNotifications([
    {
      userId:     freelancerUserId,
      type:       'deal_rejected_by_admin',
      title:      '❌ Deal Rejected by Admin',
      body:       `The admin has rejected the deal on "${job.title}". ${adminNote ? `Reason: ${adminNote}` : ''} ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, admin_note: adminNote, fallback },
    },
    {
      userId:     clientUserId,
      type:       'deal_rejected_by_admin',
      title:      '❌ Deal Rejected by Admin',
      body:       `The admin has rejected the deal on "${job.title}". ${adminNote ? `Reason: ${adminNote}` : ''} ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, admin_note: adminNote, fallback },
    },
  ]);
};

// ── Assignment ────────────────────────────────────────────────────────────────

/**
 * Assignment created → notify freelancer.
 */
const notifyAssignmentCreated = async ({ job, freelancerUserId, agreedPrice }) => {
  await notificationService.createNotification({
    userId:     freelancerUserId,
    type:       'assignment_created',
    title:      '📋 Assignment Pending Your Acceptance',
    body:       `You have been assigned to "${job.title}" for ₹${Number(agreedPrice).toLocaleString('en-IN')}. Please accept or decline from your dashboard.`,
    entityType: 'job',
    entityId:   job.id,
    data:       { job_id: job.id, job_title: job.title, agreed_price: agreedPrice },
  });
};

/**
 * Assignment accepted → notify client + admin.
 */
const notifyAssignmentAccepted = async ({ job, freelancerName, clientUserId }) => {
  const admins = await require('../../config/database').query(
    `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
  );

  const recipientNotifications = [
    {
      userId:     clientUserId,
      type:       'assignment_accepted',
      title:      '🚀 Freelancer Accepted — Work Has Started',
      body:       `${freelancerName} has accepted the assignment for "${job.title}". Your job is now in progress.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, freelancer_name: freelancerName },
    },
    ...admins.rows.map((admin) => ({
      userId:     admin.id,
      type:       'assignment_accepted',
      title:      `✅ ${freelancerName} Accepted Assignment`,
      body:       `"${job.title}" is now in progress.`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title },
    })),
  ];

  await notificationService.createBulkNotifications(recipientNotifications);
};

/**
 * Assignment declined → notify client + admin.
 */
const notifyAssignmentDeclined = async ({
  job,
  freelancerName,
  clientUserId,
  fallback,
}) => {
  const admins = await require('../../config/database').query(
    `SELECT id FROM users WHERE role = 'admin' AND is_active = true`
  );

  const fallbackMsg = fallback?.action === 're_matching'
    ? 'The job has been sent back for re-matching.'
    : 'The next candidate has been notified.';

  const recipientNotifications = [
    {
      userId:     clientUserId,
      type:       'assignment_declined',
      title:      '⚠️ Freelancer Declined',
      body:       `${freelancerName} has declined the assignment for "${job.title}". ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, fallback },
    },
    ...admins.rows.map((admin) => ({
      userId:     admin.id,
      type:       'assignment_declined',
      title:      `❌ ${freelancerName} Declined Assignment`,
      body:       `"${job.title}" needs attention. ${fallbackMsg}`,
      entityType: 'job',
      entityId:   job.id,
      data:       { job_id: job.id, job_title: job.title, fallback },
    })),
  ];

  await notificationService.createBulkNotifications(recipientNotifications);
};

// ── KYC ───────────────────────────────────────────────────────────────────────

/**
 * KYC submission reviewed → notify the user.
 */
const notifyKycReviewed = async ({ userId, level, status, adminNote }) => {
  const approved = status === 'approved';
  await notificationService.createNotification({
    userId,
    type:       approved ? 'kyc_approved' : 'kyc_rejected',
    title:      approved
      ? `✅ KYC ${level.charAt(0).toUpperCase() + level.slice(1)} Approved`
      : `❌ KYC ${level.charAt(0).toUpperCase() + level.slice(1)} Rejected`,
    body:       approved
      ? `Your ${level} KYC has been approved. You now have access to more platform features.`
      : `Your ${level} KYC was rejected.${adminNote ? ` Reason: ${adminNote}` : ' Please resubmit with correct documents.'}`,
    entityType: 'kyc',
    entityId:   null,
    data:       { level, status, admin_note: adminNote },
  });
};

module.exports = {
  notifyMatchedCandidates,
  notifyNegotiationInitiated,
  notifyNegotiationCountered,
  notifyNegotiationAccepted,
  notifyNegotiationRejected,
  notifyAdminDealPending,
  notifyDealApproved,
  notifyDealRejectedByAdmin,
  notifyAssignmentCreated,
  notifyAssignmentAccepted,
  notifyAssignmentDeclined,
  notifyKycReviewed,
};