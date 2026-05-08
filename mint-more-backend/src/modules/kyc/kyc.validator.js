const AppError = require('../../utils/AppError');

const validateBasicKyc = (body) => {
  const { date_of_birth, gender, nationality } = body;
  const errors = [];

  if (!date_of_birth) {
    errors.push('date_of_birth is required');
  } else {
    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime())) errors.push('date_of_birth must be a valid date');
    else {
      const age = Math.floor((Date.now() - dob) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) errors.push('You must be at least 18 years old');
    }
  }

  const allowedGenders = ['male', 'female', 'non_binary', 'prefer_not_to_say'];
  if (!gender || !allowedGenders.includes(gender)) {
    errors.push(`gender must be one of: ${allowedGenders.join(', ')}`);
  }

  if (!nationality || nationality.trim().length < 2) {
    errors.push('nationality is required');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateIdentityKyc = (body) => {
  const { document_type, document_number } = body;
  const errors = [];

  const allowedDocs = ['aadhaar', 'passport', 'pan', 'driving_license'];
  if (!document_type || !allowedDocs.includes(document_type)) {
    errors.push(`document_type must be one of: ${allowedDocs.join(', ')}`);
  }

  if (!document_number || document_number.trim().length < 4) {
    errors.push('document_number is required');
  }

  // Aadhaar: 12 digits
  if (document_type === 'aadhaar' && !/^\d{12}$/.test(document_number)) {
    errors.push('Aadhaar number must be exactly 12 digits');
  }

  // PAN: 10 alphanumeric
  if (document_type === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(document_number)) {
    errors.push('PAN must be in format: ABCDE1234F');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateAddressKyc = (body) => {
  const { address_line1, city, state, pincode, country } = body;
  const errors = [];

  if (!address_line1 || address_line1.trim().length < 5) {
    errors.push('address_line1 is required (min 5 chars)');
  }
  if (!city || city.trim().length < 2) {
    errors.push('city is required');
  }
  if (!state || state.trim().length < 2) {
    errors.push('state is required');
  }
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    errors.push('pincode must be a valid 6-digit code');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateAdminReview = (body) => {
  const { status, admin_note } = body;
  const errors = [];

  if (!['approved', 'rejected'].includes(status)) {
    errors.push('status must be either "approved" or "rejected"');
  }
  if (status === 'rejected' && (!admin_note || admin_note.trim().length < 5)) {
    errors.push('admin_note is required when rejecting a submission');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

module.exports = {
  validateBasicKyc,
  validateIdentityKyc,
  validateAddressKyc,
  validateAdminReview,
};