const bcrypt = require('bcrypt');
const env = require('../config/env');

/**
 * Hash a plain-text password.
 * saltRounds=12 is a good balance of security vs CPU time (~300ms).
 */
const hashPassword = (plainText) => {
  return bcrypt.hash(plainText, env.bcrypt.saltRounds);
};

/**
 * Compare plain-text password against stored hash.
 * Returns boolean — never throws (bcrypt handles mismatches gracefully).
 */
const comparePassword = (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

module.exports = { hashPassword, comparePassword };