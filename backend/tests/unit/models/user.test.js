const mongoose = require('mongoose');
const User = require('../../../models/auth/user');
const bcrypt = require('bcryptjs');

// Mock bcrypt
jest.mock('bcryptjs');

describe('User Model', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Schema Validation', () => {
    test('should require username field', () => {
      const user = new User({ password: 'test123', role: 'customer' });
      const error = user.validateSync();
      
      expect(error.errors.username).toBeDefined();
      expect(error.errors.username.message).toContain('required');
    });

    test('should require password field', () => {
      const user = new User({ username: 'testuser', role: 'customer' });
      const error = user.validateSync();
      
      expect(error.errors.password).toBeDefined();
    });

    test('should default role to customer', () => {
      const user = new User({ username: 'test', password: 'test123' });
      expect(user.role).toBe('customer');
    });

    test('should accept admin role', () => {
      const user = new User({ username: 'admin', password: 'test123', role: 'admin' });
      expect(user.role).toBe('admin');
    });

    test('should accept optional fields', () => {
      const user = new User({
        username: 'testuser',
        password: 'test123',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St'
      });
      
      expect(user.email).toBe('test@example.com');
      expect(user.phone).toBe('1234567890');
      expect(user.address).toBe('123 Test St');
    });

    test('should have createdAt default to current date', () => {
      const user = new User({ username: 'test', password: 'test123' });
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Password Hashing', () => {
    test('should have password field', () => {
      const user = new User({
        username: 'testuser',
        password: 'plaintext',
        role: 'customer'
      });

      expect(user.password).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    // Note: Password hashing is tested through integration tests
    // as it requires the actual Mongoose middleware to run
  });

  describe('matchPassword Method', () => {
    test('should compare password correctly', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const user = new User({
        username: 'testuser',
        password: 'hashed-password',
        role: 'customer'
      });

      const result = await user.matchPassword('plaintext');

      expect(bcrypt.compare).toHaveBeenCalledWith('plaintext', 'hashed-password');
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const user = new User({
        username: 'testuser',
        password: 'hashed-password',
        role: 'customer'
      });

      const result = await user.matchPassword('wrongpassword');

      expect(result).toBe(false);
    });
  });
});
