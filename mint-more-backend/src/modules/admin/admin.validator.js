const AppError = require('../../utils/AppError');

const validateApproveUser = (body) => {
  const { is_approved } = body;
  const errors = [];

  if (typeof is_approved !== 'boolean') {
    errors.push('is_approved must be a boolean (true or false)');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateSetFreelancerLevel = (body) => {
  const { level } = body;
  const allowed = ['beginner', 'intermediate', 'experienced'];
  const errors = [];

  if (!level || !allowed.includes(level)) {
    errors.push(`level must be one of: ${allowed.join(', ')}`);
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

const validateCategoryCreate = (body) => {
  const { name, slug, description } = body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('name is required (min 2 chars)');
  }

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('slug must be lowercase letters, numbers, and hyphens only');
  }

  if (errors.length > 0) {
    const err = new AppError('Validation failed', 422);
    err.errors = errors;
    throw err;
  }
};

module.exports = {
  validateApproveUser,
  validateSetFreelancerLevel,
  validateCategoryCreate,
};