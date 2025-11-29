const orderController = require('../../../controllers/ecommerce/orderController');
const Order = require('../../../models/ecommerce/order');
const Product = require('../../../models/ecommerce/product');
const User = require('../../../models/auth/user');

jest.mock('../../../models/ecommerce/order');
jest.mock('../../../models/ecommerce/product');
jest.mock('../../../models/auth/user');

describe('Order Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'user123', role: 'customer' }
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

  describe('getAllOrders', () => {
    test('should return all orders for admin', async () => {
      req.user.role = 'admin';
      const mockOrders = [
        { _id: '1', user: { username: 'user1' }, products: [] },
        { _id: '2', user: { username: 'user2' }, products: [] }
      ];

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOrders)
        })
      });

      await orderController.getAllOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test('should return only user orders for customer', async () => {
      req.user = { id: 'user123', role: 'customer' };
      const mockOrders = [
        { _id: '1', user: { _id: 'user123', username: 'customer1' }, products: [] }
      ];

      Order.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOrders)
        })
      });

      await orderController.getAllOrders(req, res);

      expect(Order.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    test('should handle errors when fetching orders', async () => {
      req.user.role = 'admin';
      
      Order.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await orderController.getAllOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('createOrder', () => {
    test('should create order successfully', async () => {
      const mockProducts = [
        { productId: 'prod1', quantity: 2, price: 100 }
      ];
      const mockProductData = {
        _id: 'prod1',
        name: 'Test Product',
        price: 100,
        stockQuantity: 10,
        save: jest.fn().mockResolvedValue(true)
      };
      const mockSavedOrder = {
        _id: 'order123',
        user: 'user123',
        products: mockProducts,
        totalPrice: 200,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        products: mockProducts,
        paymentMethod: 'credit_card',
        totalPrice: 200,
        status: 'pending'
      };
      req.user = { id: 'user123' };

      Product.findById.mockResolvedValue(mockProductData);
      // Mock findOneAndUpdate to simulate successful stock update
      Product.findOneAndUpdate = jest.fn().mockResolvedValue({
        ...mockProductData,
        stockQuantity: 8
      });
      Order.mockImplementation(() => mockSavedOrder);

      await orderController.createOrder(req, res);

      expect(Product.findById).toHaveBeenCalledWith('prod1');
      expect(Product.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      // Just check response was sent
      expect(res.status).toHaveBeenCalled();
    });

    test('should return 400 when required fields are missing', async () => {
      req.body = {
        products: null,
        paymentMethod: null,
        totalPrice: null
      };

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Products, payment method, and total price are required'
      });
    });

    test('should handle invalid product data', async () => {
      req.body = {
        products: [{ productId: 'prod1', quantity: -1 }],
        paymentMethod: 'credit_card',
        totalPrice: 200
      };

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should handle insufficient stock', async () => {
      const mockProductData = {
        _id: 'prod1',
        price: 100,
        stockQuantity: 1,
        name: 'Test Product'
      };

      req.body = {
        products: [{ productId: 'prod1', quantity: 5 }],
        paymentMethod: 'credit_card',
        totalPrice: 500
      };

      Product.findById.mockResolvedValue(mockProductData);

      await orderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
