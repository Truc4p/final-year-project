const userController = require('../../../controllers/auth/userController');
const User = require('../../../models/auth/user');

jest.mock('../../../models/auth/user');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'admin123', role: 'admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', role: 'customer' },
        { _id: '2', username: 'user2', role: 'admin' }
      ];

      User.find.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle errors when fetching users', async () => {
      User.find.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(req, res);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('getUserById', () => {
    test('should return user by id', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'customer'
      };

      req.params.id = '123';
      User.findById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('should return 404 when user not found', async () => {
      req.params.id = 'nonexistent';
      User.findById.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      User.findById.mockRejectedValue(new Error('Database error'));

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('updateUser', () => {
    test('should update user successfully without password', async () => {
      const mockUpdatedUser = {
        _id: '123',
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'customer'
      };

      req.params.id = '123';
      req.body = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test('should update user with password', async () => {
      const mockUpdatedUser = {
        _id: '123',
        username: 'testuser',
        password: 'hashed-password'
      };

      req.params.id = '123';
      req.body = {
        username: 'testuser',
        password: 'newpassword123'
      };

      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(req, res);

      // Just verify it was called - bcrypt hashing happens in the controller
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    test('should return 404 when user not found during update', async () => {
      req.params.id = 'nonexistent';
      req.body = { username: 'newname' };

      User.findByIdAndUpdate.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('User not found');
    });

    test('should handle errors during update', async () => {
      req.params.id = '123';
      req.body = { username: 'newname' };

      User.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await userController.updateUser(req, res);

      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });
});
