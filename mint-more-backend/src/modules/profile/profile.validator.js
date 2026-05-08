const AppError = require('../../utils/AppError');

const validateProfileUpdate = (body) => {
  const { full_name, phone, bio, gender, date_of_birth, skills } = body;
  const errors = [];

  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || full_name.trim().length < 2) {
      errors.push('full_name must be at least 2 characters');
    }
  }

  if (phone !== undefined) {
    // Basic Indian phone number validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      errors.push('phone must be a valid 10-digit Indian mobile number');
    }
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 500) {
      errors.push('bio must be a string under 500 characters');
    }
  }

  if (gender !== undefined) {
    const allowed = ['male', 'female', 'non_binary', 'prefer_not_to_say'];
    if (!allowed.includes(gender)) {
      errors.push(`gender must be one of: ${allowed.join(', ')}`);
    }
  }

  if (date_of_birth !== undefined) {
    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime())) {
      errors.push('date_of_birth must be a valid date (YYYY-MM-DD)');
    } else {
      const age = Math.floor((Date.now() - dob) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) errors.push('You must be at least 18 years old');
      if (age > 100) errors.push('Invalid date of birth');
    }
  }

  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      errors.push('skills must be an array of strings');
    } else if (skills.length > 20) {
      errors.push('You can add up to 20 skills');
    } else if (skills.some((s) => typeof s !== 'string' || s.length > 50)) {
      errors.push('Each skill must be a string under 50 characters');
    }
  }

  // Add inside validateProfileUpdate, after the skills block:
  const { price_min, price_max, pricing_visibility } = body;

  if (price_min !== undefined) {
    const val = parseFloat(price_min);
    if (isNaN(val) || val < 0) {
      errors.push('price_min must be a positive number');
    }
  }

  if (price_max !== undefined) {
    const val = parseFloat(price_max);
    if (isNaN(val) || val < 0) {
      errors.push('price_max must be a positive number');
    }
  }

  if (price_min !== undefined && price_max !== undefined) {
    if (parseFloat(price_min) >= parseFloat(price_max)) {
      errors.push('price_min must be less than price_max');
    }
  }

  if (pricing_visibility !== undefined && typeof pricing_visibility !== 'boolean') {
    errors.push('pricing_visibility must be a boolean');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

module.exports = { validateProfileUpdate };