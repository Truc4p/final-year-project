const jwt = require('jsonwebtoken');
const User = require('../../../models/auth/user');

/**
 * Create a test user in the database
 */
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    password: 'password123',
    email: 'test@example.com',
    role: 'customer',
    ...userData
  };

  const user = new User(defaultUser);
  await user.save();
  return user;
};

/**
 * Create an admin user in the database
 */
const createAdminUser = async (userData = {}) => {
  return createTestUser({
    username: 'adminuser',
    email: 'admin@example.com',
    role: 'admin',
    ...userData
  });
};

/**
 * Generate JWT token for a user
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, username: user.username, role: user.role } },
    'secret', // Must match the secret in auth middleware and controllers
    { expiresIn: '1h' }
  );
};

/**
 * Get authorization header with Bearer token
 */
const getAuthHeader = (token) => {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Create authenticated request headers
 */
const createAuthHeaders = (user) => {
  const token = generateAuthToken(user);
  return getAuthHeader(token);
};

module.exports = {
  createTestUser,
  createAdminUser,
  generateAuthToken,
  getAuthHeader,
  createAuthHeaders
};
