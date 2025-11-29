const authMiddleware = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { 
      header: jest.fn(),
      method: 'GET',
      originalUrl: '/api/test'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Clear console.log to reduce test noise
    console.log = jest.fn();
  });

  test('should authenticate valid Bearer token', () => {
    req.header.mockReturnValue('Bearer valid-token');
    jwt.verify.mockReturnValue({ user: { id: '123', role: 'admin' } });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'secret');
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: '123', role: 'admin' });
  });

  test('should authenticate valid x-auth-token (backward compatibility)', () => {
    req.header.mockImplementation((header) => {
      if (header === 'Authorization') return null;
      if (header === 'x-auth-token') return 'valid-token';
    });
    jwt.verify.mockReturnValue({ user: { id: '456', role: 'customer' } });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'secret');
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: '456', role: 'customer' });
  });

  test('should reject missing token', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should reject invalid token', () => {
    req.header.mockReturnValue('Bearer invalid-token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should not log polling requests', () => {
    req.originalUrl = '/chat/admin/active-chats';
    req.header.mockReturnValue('Bearer valid-token');
    jwt.verify.mockReturnValue({ user: { id: '123', role: 'admin' } });

    authMiddleware(req, res, next);

    // Should not log polling requests
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Auth middleware called')
    );
  });
});
