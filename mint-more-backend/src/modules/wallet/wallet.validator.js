const AppError = require('../../utils/AppError');

const validateTopUp = (body) => {
  const { amount } = body;
  const errors = [];

  const parsed = parseFloat(amount);
  if (!amount || isNaN(parsed) || parsed <= 0) {
    errors.push('amount must be a positive number');
  }
  if (parsed < 100) {
    errors.push('Minimum top-up amount is ₹100');
  }
  if (parsed > 500000) {
    errors.push('Maximum top-up amount is ₹5,00,000 per transaction');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateWithdrawal = (body) => {
  const { amount, account_name, account_number, ifsc_code, upi_id } = body;
  const errors = [];

  const parsed = parseFloat(amount);
  if (!amount || isNaN(parsed) || parsed <= 0) {
    errors.push('amount must be a positive number');
  }
  if (parsed < 100) {
    errors.push('Minimum withdrawal amount is ₹100');
  }

  if (!account_name || account_name.trim().length < 2) {
    errors.push('account_name is required');
  }

  // Must have either bank account OR UPI
  const hasBankAccount = account_number && account_number.trim().length > 0;
  const hasUpi         = upi_id && upi_id.trim().length > 0;

  if (!hasBankAccount && !hasUpi) {
    errors.push('Either account_number or upi_id is required');
  }

  if (hasBankAccount) {
    if (!/^\d{9,18}$/.test(account_number)) {
      errors.push('account_number must be 9-18 digits');
    }
    if (!ifsc_code || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
      errors.push('ifsc_code must be valid (e.g. SBIN0001234)');
    }
  }

  if (hasUpi && !/^[\w.\-]+@[\w.\-]+$/.test(upi_id)) {
    errors.push('upi_id must be a valid UPI ID (e.g. name@upi)');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateAdminWithdrawalReview = (body) => {
  const { action, admin_note } = body;
  const errors = [];

  if (!['approve', 'reject'].includes(action)) {
    errors.push('action must be approve or reject');
  }
  if (action === 'reject' && (!admin_note || admin_note.trim().length < 5)) {
    errors.push('admin_note is required when rejecting a withdrawal');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

module.exports = {
  validateTopUp,
  validateWithdrawal,
  validateAdminWithdrawalReview,
};