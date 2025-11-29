const productController = require('../../../controllers/ecommerce/productController');
const Product = require('../../../models/ecommerce/product');
const fs = require('fs');
const path = require('path');

jest.mock('../../../models/ecommerce/product');
jest.mock('fs');
jest.mock('path');

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: null,
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

  describe('getAllProducts', () => {
    test('should return all products successfully', async () => {
      const mockProducts = [
        { _id: '1', name: 'Product 1', price: 100, category: { name: 'Category 1' } },
        { _id: '2', name: 'Product 2', price: 200, category: { name: 'Category 2' } }
      ];

      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProducts)
      });

      await productController.getAllProducts(req, res);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should handle errors when fetching products', async () => {
      Product.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('getProductById', () => {
    test('should return product by id', async () => {
      const mockProduct = {
        _id: '123',
        name: 'Test Product',
        price: 100,
        category: { name: 'Test Category' }
      };

      req.params.id = '123';
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      await productController.getProductById(req, res);

      expect(Product.findById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should return 404 when product not found', async () => {
      req.params.id = 'nonexistent';
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Product not found');
    });

    test('should handle server errors', async () => {
      req.params.id = '123';
      Product.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await productController.getProductById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('createProduct', () => {
    test('should create product with all fields', async () => {
      const mockSavedProduct = {
        _id: '123',
        name: 'New Product',
        price: 150,
        stockQuantity: 10
      };

      req.body = {
        name: 'New Product',
        categoryId: 'cat123',
        price: 150,
        description: 'Test description',
        stockQuantity: 10,
        ingredients: JSON.stringify(['ingredient1', 'ingredient2']),
        skinType: JSON.stringify(['oily', 'dry']),
        benefits: JSON.stringify(['hydrating', 'soothing']),
        tags: JSON.stringify(['organic', 'natural']),
        usage: 'Apply daily',
        skinConcerns: JSON.stringify(['acne', 'wrinkles'])
      };
      req.file = { path: '/uploads/test.jpg' };

      Product.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedProduct)
      }));

      await productController.createProduct(req, res);

      expect(Product).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedProduct);
    });

    test('should create product without optional image', async () => {
      const mockSavedProduct = {
        _id: '123',
        name: 'New Product',
        price: 150
      };

      req.body = {
        name: 'New Product',
        categoryId: 'cat123',
        price: 150,
        description: 'Test description',
        stockQuantity: 10,
        ingredients: JSON.stringify([]),
        skinType: JSON.stringify([]),
        benefits: JSON.stringify([]),
        tags: JSON.stringify([]),
        skinConcerns: JSON.stringify([])
      };
      req.file = null;

      Product.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedProduct)
      }));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedProduct);
    });

    test('should handle errors during product creation', async () => {
      req.body = {
        name: 'New Product',
        price: 150,
        ingredients: JSON.stringify([]),
        skinType: JSON.stringify([]),
        benefits: JSON.stringify([]),
        tags: JSON.stringify([]),
        skinConcerns: JSON.stringify([])
      };

      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });
});
