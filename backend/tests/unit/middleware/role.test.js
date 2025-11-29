const roleMiddleware = require('../../../middleware/role');

describe('Role Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        id: '123',
        username: 'testuser',
        role: 'customer'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    console.log = jest.fn();
  });

  test('should allow access when user has required role', () => {
    const middleware = roleMiddleware(['customer', 'admin']);
    
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should allow admin access', () => {
    req.user.role = 'admin';
    const middleware = roleMiddleware(['admin']);
    
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should deny access when user role not in allowed roles', () => {
    req.user.role = 'customer';
    const middleware = roleMiddleware(['admin']);
    
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Access denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should deny admin when only customer role allowed', () => {
    req.user.role = 'admin';
    const middleware = roleMiddleware(['customer']);
    
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Access denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should work with single role in array', () => {
    req.user.role = 'admin';
    const middleware = roleMiddleware(['admin']);
    
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should work with multiple allowed roles', () => {
    req.user.role = 'customer';
    const middleware = roleMiddleware(['customer', 'admin', 'moderator']);
    
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
