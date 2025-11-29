const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const productRoutes = require('../../../routes/ecommerce/productRoutes');
const Product = require('../../../models/ecommerce/product');
const Category = require('../../../models/ecommerce/category');
const { createTestUser, createAdminUser, createAuthHeaders } = require('../helpers/testHelpers');

// Import setup (runs beforeAll, afterEach, afterAll hooks)
require('../setup');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Integration Tests', () => {
  let adminUser;
  let customerUser;
  let adminHeaders;
  let customerHeaders;
  let testCategory;

  beforeEach(async () => {
    // Create test users
    adminUser = await createAdminUser({ username: 'admin', password: 'admin123' });
    customerUser = await createTestUser({ username: 'customer', password: 'customer123' });
    
    // Create auth headers
    adminHeaders = createAuthHeaders(adminUser);
    customerHeaders = createAuthHeaders(customerUser);
    
    // Create a test category in the database
    testCategory = await Category.create({ name: 'Test Category' });
  });

  describe('GET /api/products', () => {
    test('should get all products', async () => {
      // Create test products
      await Product.create([
        { name: 'Product 1', category: testCategory._id, price: 100, description: 'Test product 1', stockQuantity: 10 },
        { name: 'Product 2', category: testCategory._id, price: 200, description: 'Test product 2', stockQuantity: 20 }
      ]);

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
    });

    test('should return empty array when no products exist', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by id', async () => {
      const product = await Product.create({
        name: 'Test Product',
        category: testCategory._id,
        price: 150,
        description: 'A test product',
        stockQuantity: 5
      });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test Product');
      expect(response.body.price).toBe(150);
      expect(response.body._id).toBe(product._id.toString());
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.text).toContain('not found');
    });

    test('should return 500 for invalid product id format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(500);

      expect(response.text).toContain('Server Error');
    });
  });

  describe('POST /api/products', () => {
    test('should create product with admin auth', async () => {
      const productData = {
        name: 'New Product',
        categoryId: testCategory._id.toString(),
        price: 250,
        description: 'Brand new product',
        stockQuantity: 15,
        skinType: JSON.stringify(['oily', 'combination']),
        ingredients: JSON.stringify(['water', 'glycerin'])
      };

      const response = await request(app)
        .post('/api/products')
        .set(adminHeaders)
        .send(productData)
        .expect(201);

      // Controller returns the product object directly, not wrapped
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body._id).toBeDefined();

      // Verify product was saved to database
      const savedProduct = await Product.findOne({ name: productData.name });
      expect(savedProduct).toBeTruthy();
      expect(savedProduct.stockQuantity).toBe(15);
      expect(savedProduct.skinType).toEqual(['oily', 'combination']);
    });

    test('should reject product creation without auth', async () => {
      const productData = {
        name: 'Unauthorized Product',
        price: 100,
        description: 'Should not be created',
        stockQuantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.msg).toBeDefined(); // Auth middleware returns 'msg'

      // Verify product was NOT created
      const product = await Product.findOne({ name: productData.name });
      expect(product).toBeNull();
    });

    test('should reject product creation with customer role', async () => {
      const productData = {
        name: 'Customer Product',
        price: 100,
        description: 'Customer cannot create',
        stockQuantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set(customerHeaders)
        .send(productData)
        .expect(403);

      expect(response.body.error || response.body.msg).toBeTruthy(); // Could be either

      // Verify product was NOT created
      const product = await Product.findOne({ name: productData.name });
      expect(product).toBeNull();
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set(adminHeaders)
        .send({ name: 'Incomplete Product' })
        .expect(500); // Mongoose validation error returns 500

      expect(response.text).toContain('Server Error');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product with admin auth', async () => {
      const product = await Product.create({
        name: 'Original Name',
        category: testCategory._id,
        price: 100,
        description: 'Original description',
        stockQuantity: 10
      });

      const updateData = {
        name: 'Updated Name',
        price: 150,
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .set(adminHeaders)
        .send(updateData)
        .expect(200);

      // Controller returns product object directly
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.price).toBe(150);

      // Verify changes in database
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.name).toBe('Updated Name');
      expect(updatedProduct.price).toBe(150);
    });

    test('should return 404 when updating non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set(adminHeaders)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.text).toContain('not found');
    });

    test('should reject update without auth', async () => {
      const product = await Product.create({
        name: 'Product',
        category: testCategory._id,
        price: 100,
        description: 'Test',
        stockQuantity: 10
      });

      const response = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ name: 'Hacked Name' })
        .expect(401);

      // Verify product was NOT updated
      const unchangedProduct = await Product.findById(product._id);
      expect(unchangedProduct.name).toBe('Product');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product with admin auth', async () => {
      const product = await Product.create({
        name: 'To Be Deleted',
        category: testCategory._id,
        price: 100,
        description: 'Will be deleted',
        stockQuantity: 10
      });

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set(adminHeaders)
        .expect(204); // DELETE returns 204 No Content

      // Verify product was deleted from database
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    test('should return 404 when deleting non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set(adminHeaders)
        .expect(404);

      expect(response.text).toContain('not found');
    });

    test('should reject deletion without auth', async () => {
      const product = await Product.create({
        name: 'Protected Product',
        category: testCategory._id,
        price: 100,
        description: 'Cannot delete without auth',
        stockQuantity: 10
      });

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(401);

      // Verify product still exists
      const existingProduct = await Product.findById(product._id);
      expect(existingProduct).toBeTruthy();
    });

    test('should reject deletion with customer role', async () => {
      const product = await Product.create({
        name: 'Customer Protected',
        category: testCategory._id,
        price: 100,
        description: 'Customer cannot delete',
        stockQuantity: 10
      });

      const response = await request(app)
        .delete(`/api/products/${product._id}`)
        .set(customerHeaders)
        .expect(403);

      // Verify product still exists
      const existingProduct = await Product.findById(product._id);
      expect(existingProduct).toBeTruthy();
    });
  });

  describe('Product Data Integrity', () => {
    test('should handle JSON array fields correctly', async () => {
      const productData = {
        name: 'Complex Product',
        categoryId: testCategory._id.toString(),
        price: 300,
        description: 'Product with arrays',
        stockQuantity: 20,
        skinType: JSON.stringify(['dry', 'sensitive', 'normal']),
        ingredients: JSON.stringify(['water', 'hyaluronic acid', 'niacinamide']),
        benefits: JSON.stringify(['hydration', 'brightening'])
      };

      const response = await request(app)
        .post('/api/products')
        .set(adminHeaders)
        .send(productData)
        .expect(201);

      const savedProduct = await Product.findById(response.body._id);
      expect(savedProduct.skinType).toHaveLength(3);
      expect(savedProduct.skinType).toContain('dry');
      expect(savedProduct.ingredients).toHaveLength(3);
      expect(savedProduct.benefits).toHaveLength(2);
    });

    test('should maintain stock quantity accuracy', async () => {
      const product = await Product.create({
        name: 'Stock Test',
        category: testCategory._id,
        price: 100,
        description: 'Test stock',
        stockQuantity: 50
      });

      // Update stock
      await request(app)
        .put(`/api/products/${product._id}`)
        .set(adminHeaders)
        .send({ stockQuantity: 30 })
        .expect(200);

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stockQuantity).toBe(30);
    });
  });
});
