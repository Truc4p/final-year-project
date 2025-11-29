const paymentController = require('../../../controllers/ecommerce/paymentController');
const Order = require('../../../models/ecommerce/order');
const crypto = require('crypto');

jest.mock('../../../models/ecommerce/order');
jest.mock('crypto');

describe('Payment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      user: { id: 'user123', role: 'customer' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn()
    };
    console.log = jest.fn();
    console.error = jest.fn();

    // Mock environment variables
    process.env.VNP_TMNCODE = 'TEST_TMNCODE';
    process.env.VNP_HASHSECRET = 'TEST_SECRET';
    process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNP_RETURNURL = 'http://localhost:3000/payment/vnpay/return';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVnpayPayment', () => {
    test('should create VNPay payment URL successfully', async () => {
      const mockOrder = {
        _id: '123456',
        user: 'user123',
        totalPrice: 200000,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        user: 'user123',
        products: [{ productId: 'prod1', quantity: 2 }],
        paymentMethod: 'vnpay',
        totalPrice: 200000,
        subtotal: 180000,
        tax: 18000,
        taxRate: 10,
        shippingFee: 2000,
        shippingLocation: 'Ho Chi Minh City'
      };

      Order.mockImplementation(() => mockOrder);
      
      // Mock crypto for HMAC
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('mocked-signature')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);

      await paymentController.createVnpayPayment(req, res);

      expect(Order).toHaveBeenCalled();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('paymentUrl');
      expect(response).toHaveProperty('orderId');
    });

    test('should handle missing required fields', async () => {
      req.body = {
        user: null,
        products: null
      };

      await paymentController.createVnpayPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should handle order creation errors', async () => {
      req.body = {
        user: 'user123',
        products: [{ productId: 'prod1', quantity: 2 }],
        paymentMethod: 'vnpay',
        totalPrice: 200000
      };

      Order.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      await paymentController.createVnpayPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('vnpayReturn', () => {
    test('should handle successful payment callback', async () => {
      const mockOrder = {
        _id: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      req.query = {
        vnp_TxnRef: 'order123',
        vnp_ResponseCode: '00',
        vnp_Amount: '20000000',
        vnp_SecureHash: 'valid-hash'
      };

      Order.findById.mockResolvedValue(mockOrder);

      // Mock crypto verification
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-hash')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);

      await paymentController.vnpayReturn(req, res);

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(mockOrder.status).toBe('confirmed');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    test('should handle failed payment', async () => {
      const mockOrder = {
        _id: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      req.query = {
        vnp_TxnRef: 'order123',
        vnp_ResponseCode: '24', // Failed transaction
        vnp_SecureHash: 'valid-hash'
      };

      Order.findById.mockResolvedValue(mockOrder);

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-hash')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);

      await paymentController.vnpayReturn(req, res);

      expect(mockOrder.status).toBe('cancelled');
      expect(mockOrder.save).toHaveBeenCalled();
    });

    test('should handle invalid signature', async () => {
      req.query = {
        vnp_TxnRef: 'order123',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'invalid-hash'
      };

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-hash')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);

      await paymentController.vnpayReturn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: '97' })
      );
    });

    test('should handle order not found', async () => {
      req.query = {
        vnp_TxnRef: 'nonexistent',
        vnp_ResponseCode: '00',
        vnp_SecureHash: 'valid-hash'
      };

      Order.findById.mockResolvedValue(null);

      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-hash')
      };
      crypto.createHmac = jest.fn().mockReturnValue(mockHmac);

      await paymentController.vnpayReturn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: '01' })
      );
    });
  });
});
