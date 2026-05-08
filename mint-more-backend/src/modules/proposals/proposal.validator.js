const AppError = require('../../utils/AppError');

const validateSubmitProposal = (body) => {
  const { cover_letter, proposed_amount, proposed_days } = body;
  const errors = [];

  if (!cover_letter || cover_letter.trim().length < 30) {
    errors.push('cover_letter is required (min 30 characters)');
  }

  if (cover_letter && cover_letter.trim().length > 2000) {
    errors.push('cover_letter must be under 2000 characters');
  }

  if (proposed_amount !== undefined && proposed_amount !== null) {
    const amount = parseFloat(proposed_amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('proposed_amount must be a positive number');
    }
  }

  if (proposed_days !== undefined && proposed_days !== null) {
    const days = parseInt(proposed_days, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      errors.push('proposed_days must be between 1 and 365');
    }
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateAdminReviewProposal = (body) => {
  const { status, admin_note } = body;
  const allowed = ['shortlisted', 'rejected'];
  const errors = [];

  if (!status || !allowed.includes(status)) {
    errors.push(`status must be one of: ${allowed.join(', ')}`);
  }

  if (status === 'rejected' && (!admin_note || admin_note.trim().length < 5)) {
    errors.push('admin_note is required when rejecting a proposal');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

module.exports = { validateSubmitProposal, validateAdminReviewProposal };