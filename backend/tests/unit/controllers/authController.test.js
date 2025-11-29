const authController = require('../../../controllers/auth/authController');
const User = require('../../../models/auth/user');
const jwt = require('jsonwebtoken');

jest.mock('../../../models/auth/user');
jest.mock('jsonwebtoken');

describe('Auth Controller - registerUser', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        password: 'password123',
        role: 'customer'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  test('should register a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue({
      id: '123',
      username: 'testuser',
      role: 'customer'
    });
    jwt.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, 'mock-token');
    });

    await authController.registerUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: 'mock-token' });
  });

  test('should reject registration if user exists', async () => {
    User.findOne.mockResolvedValue({ username: 'testuser' });

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'User already exists' });
  });

  test('should validate admin key for admin registration', async () => {
    req.body.role = 'admin';
    req.body.adminKey = 'wrong-key';

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid admin key' });
  });
});
