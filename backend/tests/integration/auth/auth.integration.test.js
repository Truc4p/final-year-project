const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../routes/auth/authRoutes');
const User = require('../../../models/auth/user');
const jwt = require('jsonwebtoken');

// Import setup (runs beforeAll, afterEach, afterAll hooks)
require('../setup');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new customer user', async () => {
      const userData = {
        username: 'newcustomer',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTruthy();

      // Verify user was saved to database
      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser).toBeTruthy();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.role).toBe('customer');
      
      // Verify JWT token payload
      const decoded = jwt.verify(response.body.token, 'secret');
      expect(decoded.user.username).toBe(userData.username);
      expect(decoded.user.role).toBe('customer');
    });

    test('should register a new admin user with valid admin key', async () => {
      const userData = {
        username: 'newadmin',
        password: 'password123',
        role: 'admin',
        adminKey: 'secret' // Must match validAdminKey in controller
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');

      // Verify in database
      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser.role).toBe('admin');
      
      // Verify JWT token
      const decoded = jwt.verify(response.body.token, 'secret');
      expect(decoded.user.role).toBe('admin');
    });

    test('should reject admin registration with invalid admin key', async () => {
      const userData = {
        username: 'fakeadmin',
        password: 'password123',
        role: 'admin',
        adminKey: 'wrong-key'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.msg).toContain('Invalid admin key');

      // Verify user was NOT created
      const user = await User.findOne({ username: userData.username });
      expect(user).toBeNull();
    });

    test('should reject duplicate username', async () => {
      // Create first user
      const userData = {
        username: 'duplicateuser',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      // Try to create second user with same username
      const duplicateData = {
        username: 'duplicateuser',
        password: 'password456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.msg).toContain('already exists');

      // Verify only one user exists
      const users = await User.find({ username: 'duplicateuser' });
      expect(users).toHaveLength(1);
    });

    test('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'incomplete' })
        .expect(500);

      // No validation middleware, so missing password causes 500 error
      expect(response.text).toContain('Server error');
    });

    test('should hash password before saving', async () => {
      const userData = {
        username: 'passwordtest',
        password: 'plainpassword'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      const savedUser = await User.findOne({ username: userData.username });
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const user = new User({
        username: 'loginuser',
        password: 'password123',
        role: 'customer'
      });
      await user.save();
    });

    test('should login with valid credentials', async () => {
      const credentials = {
        username: 'loginuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.role).toBe('customer');

      // Verify token is valid JWT
      const decoded = jwt.verify(response.body.token, 'secret');
      expect(decoded.user.id).toBeDefined();
      expect(decoded.user.username).toBe(credentials.username);
      expect(decoded.user.role).toBe('customer');
    });

    test('should reject login with wrong password', async () => {
      const credentials = {
        username: 'loginuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.msg).toContain('Invalid');
    });

    test('should reject login with non-existent username', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.msg).toContain('Invalid');
    });

    test('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'loginuser' })
        .expect(500);

      // No validation middleware, so missing password causes 500 error
      expect(response.text).toContain('Server error');
    });
  });

  describe('Authentication Flow', () => {
    test('should complete full register and login flow', async () => {
      // Register
      const userData = {
        username: 'flowuser',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      const registrationToken = registerResponse.body.token;
      expect(registrationToken).toBeDefined();

      // Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        })
        .expect(200);

      const loginToken = loginResponse.body.token;
      expect(loginToken).toBeDefined();

      // Both tokens should be valid and contain same user info
      const decodedRegister = jwt.verify(registrationToken, 'secret');
      const decodedLogin = jwt.verify(loginToken, 'secret');

      expect(decodedRegister.user.id).toBe(decodedLogin.user.id);
      expect(decodedRegister.user.username).toBe(decodedLogin.user.username);
    });
  });
});
