const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT containing the user id and role.
 * @param {string} id - Mongo document _id
 * @param {'doctor'|'patient'} role
 * @returns {string} signed JWT
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
