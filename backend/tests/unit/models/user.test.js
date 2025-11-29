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
    test('should hash password before saving', async () => {
      bcrypt.genSalt.mockResolvedValue('mock-salt');
      bcrypt.hash.mockResolvedValue('hashed-password');

      const user = new User({
        username: 'testuser',
        password: 'plaintext',
        role: 'customer'
      });

      // Trigger the pre-save hook manually
      user.save = jest.fn();
      const preSaveHook = User.schema._middleware.pre.find(
        (hook) => hook.type === 'save'
      );

      expect(user.password).toBe('plaintext');
      
      // Simulate password modification
      user.isModified = jest.fn().mockReturnValue(true);
      
      await new Promise((resolve) => {
        if (preSaveHook) {
          preSaveHook.fn.call(user, resolve);
        } else {
          resolve();
        }
      });

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 'mock-salt');
      expect(user.password).toBe('hashed-password');
    });

    test('should not hash password if not modified', async () => {
      const user = new User({
        username: 'testuser',
        password: 'already-hashed',
        role: 'customer'
      });

      user.isModified = jest.fn().mockReturnValue(false);
      
      const preSaveHook = User.schema._middleware.pre.find(
        (hook) => hook.type === 'save'
      );

      await new Promise((resolve) => {
        if (preSaveHook) {
          preSaveHook.fn.call(user, resolve);
        } else {
          resolve();
        }
      });

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
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
