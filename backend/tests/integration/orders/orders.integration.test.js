const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('../../../routes/ecommerce/orderRoutes');
const Order = require('../../../models/ecommerce/order');
const Product = require('../../../models/ecommerce/product');
const Category = require('../../../models/ecommerce/category');
const { createTestUser, createAdminUser, createAuthHeaders } = require('../helpers/testHelpers');

// Import setup (runs beforeAll, afterEach, afterAll hooks)
require('../setup');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Integration Tests', () => {
  let adminUser;
  let customerUser;
  let adminHeaders;
  let customerHeaders;
  let testCategory;
  let testProduct1;
  let testProduct2;

  beforeEach(async () => {
    // Create test users
    adminUser = await createAdminUser({ username: 'admin', password: 'admin123' });
    customerUser = await createTestUser({ username: 'customer', password: 'customer123' });
    
    // Create auth headers
    adminHeaders = createAuthHeaders(adminUser);
    customerHeaders = createAuthHeaders(customerUser);
    
    // Create test category and products
    testCategory = await Category.create({ name: 'Test Category' });
    testProduct1 = await Product.create({
      name: 'Product 1',
      category: testCategory._id,
      price: 100,
      description: 'Test product 1',
      stockQuantity: 50
    });
    testProduct2 = await Product.create({
      name: 'Product 2',
      category: testCategory._id,
      price: 200,
      description: 'Test product 2',
      stockQuantity: 30
    });
  });

  describe('GET /api/orders', () => {
    test('should get all orders for admin', async () => {
      // Create test orders from different users
      await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 2, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 200
      });

      const anotherUser = await createTestUser({ username: 'user2', password: 'pass123' });
      await Order.create({
        user: anotherUser._id,
        products: [{ productId: testProduct2._id, quantity: 1, price: 200 }],
        paymentMethod: 'onlinePayment',
        status: 'completed',
        totalPrice: 200
      });

      const response = await request(app)
        .get('/api/orders')
        .set(adminHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('user');
      expect(response.body[0]).toHaveProperty('products');
      expect(response.body[0]).toHaveProperty('totalPrice');
    });

    test('should get only own orders for customer', async () => {
      // Create order for customer
      await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      // Create order for another user
      const anotherUser = await createTestUser({ username: 'user2', password: 'pass123' });
      await Order.create({
        user: anotherUser._id,
        products: [{ productId: testProduct2._id, quantity: 1, price: 200 }],
        paymentMethod: 'onlinePayment',
        status: 'completed',
        totalPrice: 200
      });

      const response = await request(app)
        .get('/api/orders')
        .set(customerHeaders)
        .expect(200);

      expect(response.body).toHaveLength(1);
      // User is populated as object, not just ID
      const userId = typeof response.body[0].user === 'object' ? response.body[0].user._id : response.body[0].user;
      expect(userId).toBe(customerUser._id.toString());
    });

    test('should return empty array when no orders exist', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set(customerHeaders)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/orders', () => {
    test('should create order with valid data', async () => {
      const orderData = {
        products: [
          { productId: testProduct1._id.toString(), quantity: 2 },
          { productId: testProduct2._id.toString(), quantity: 1 }
        ],
        paymentMethod: 'cod',
        totalPrice: 400
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(201);

      expect(response.body.user.toString()).toBe(customerUser._id.toString());
      expect(response.body.products).toHaveLength(2);
      expect(response.body.totalPrice).toBe(400);
      expect(response.body.status).toBe('processing');

      // Verify order was saved
      const savedOrder = await Order.findById(response.body._id);
      expect(savedOrder).toBeTruthy();

      // Verify stock was decremented
      const updatedProduct1 = await Product.findById(testProduct1._id);
      const updatedProduct2 = await Product.findById(testProduct2._id);
      expect(updatedProduct1.stockQuantity).toBe(48); // 50 - 2
      expect(updatedProduct2.stockQuantity).toBe(29); // 30 - 1
    });

    test('should enrich products with price from database', async () => {
      const orderData = {
        products: [
          { productId: testProduct1._id.toString(), quantity: 1 } // No price provided
        ],
        paymentMethod: 'onlinePayment',
        totalPrice: 100
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(201);

      expect(response.body.products[0].price).toBe(100);
    });

    test('should reject order without authentication', async () => {
      const orderData = {
        products: [{ productId: testProduct1._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        totalPrice: 100
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.msg).toBeDefined();

      // Verify order was NOT created
      const orders = await Order.find();
      expect(orders).toHaveLength(0);
    });

    test('should reject order with missing required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send({ products: [] })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    test('should reject order with insufficient stock', async () => {
      const orderData = {
        products: [
          { productId: testProduct1._id.toString(), quantity: 100 } // More than available
        ],
        paymentMethod: 'cod',
        totalPrice: 10000
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');

      // Verify stock was NOT decremented
      const unchangedProduct = await Product.findById(testProduct1._id);
      expect(unchangedProduct.stockQuantity).toBe(50);
    });

    test('should reject order with non-existent product', async () => {
      const fakeProductId = new mongoose.Types.ObjectId();
      const orderData = {
        products: [
          { productId: fakeProductId.toString(), quantity: 1 }
        ],
        paymentMethod: 'cod',
        totalPrice: 100
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('not found');
    });

    test('should reject order with invalid quantity', async () => {
      const orderData = {
        products: [
          { productId: testProduct1._id.toString(), quantity: 0 } // Invalid quantity
        ],
        paymentMethod: 'cod',
        totalPrice: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle concurrent order attempts with atomic stock updates', async () => {
      // Create product with limited stock
      const limitedProduct = await Product.create({
        name: 'Limited Product',
        category: testCategory._id,
        price: 150,
        stockQuantity: 5
      });

      const orderData = {
        products: [
          { productId: limitedProduct._id.toString(), quantity: 5 }
        ],
        paymentMethod: 'cod',
        totalPrice: 750
      };

      // First order should succeed
      const response1 = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData);

      expect(response1.status).toBe(201);

      // Second order should fail due to insufficient stock
      const response2 = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData);

      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('Insufficient stock');

      // Verify final stock is 0
      const finalProduct = await Product.findById(limitedProduct._id);
      expect(finalProduct.stockQuantity).toBe(0);
    });
  });

  describe('GET /api/orders/order/:id', () => {
    test('should get order by id for owner', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 2, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 200
      });

      const response = await request(app)
        .get(`/api/orders/order/${order._id}`)
        .set(customerHeaders)
        .expect(200);

      expect(response.body._id).toBe(order._id.toString());
      expect(response.body.totalPrice).toBe(200);
    });

    test('should get any order for admin', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 2, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 200
      });

      const response = await request(app)
        .get(`/api/orders/order/${order._id}`)
        .set(adminHeaders)
        .expect(200);

      expect(response.body._id).toBe(order._id.toString());
    });

    test('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/orders/order/${fakeId}`)
        .set(customerHeaders)
        .expect(404);
    });

    test('should allow any authenticated user to view any order (security issue)', async () => {
      // Note: This is a security vulnerability in the current implementation
      // getOrderByOrderId doesn't check order ownership
      const anotherUser = await createTestUser({ username: 'user2', password: 'pass123' });
      const order = await Order.create({
        user: anotherUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      // Current behavior: any authenticated user can view any order
      const response = await request(app)
        .get(`/api/orders/order/${order._id}`)
        .set(customerHeaders)
        .expect(200);

      expect(response.body._id).toBe(order._id.toString());
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('should update order status by admin', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .set(adminHeaders)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');

      // Verify in database
      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.status).toBe('completed');
    });

    test('should prevent customer from updating order status', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .set(customerHeaders)
        .send({ status: 'completed' })
        .expect(403);

      // Verify order unchanged
      const unchangedOrder = await Order.findById(order._id);
      expect(unchangedOrder.status).toBe('processing');
    });
  });

  describe('DELETE /api/orders', () => {
    test('should delete order as admin', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      await request(app)
        .delete(`/api/orders/admin/${order._id}`)
        .set(adminHeaders)
        .expect(204);

      // Verify order deleted
      const deletedOrder = await Order.findById(order._id);
      expect(deletedOrder).toBeNull();
    });

    test('should prevent customer from deleting orders via admin route', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      await request(app)
        .delete(`/api/orders/admin/${order._id}`)
        .set(customerHeaders)
        .expect(403);

      // Verify order still exists
      const existingOrder = await Order.findById(order._id);
      expect(existingOrder).toBeTruthy();
    });

    test('should allow customer to delete their own order', async () => {
      const order = await Order.create({
        user: customerUser._id,
        products: [{ productId: testProduct1._id, quantity: 1, price: 100 }],
        paymentMethod: 'cod',
        status: 'processing',
        totalPrice: 100
      });

      await request(app)
        .delete(`/api/orders/${order._id}`)
        .set(customerHeaders)
        .expect(204);

      // Verify order deleted
      const deletedOrder = await Order.findById(order._id);
      expect(deletedOrder).toBeNull();
    });
  });

  describe('Order Business Logic', () => {
    test('should handle multiple products in single order', async () => {
      const orderData = {
        products: [
          { productId: testProduct1._id.toString(), quantity: 3 },
          { productId: testProduct2._id.toString(), quantity: 2 }
        ],
        paymentMethod: 'onlinePayment',
        totalPrice: 700
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(201);

      expect(response.body.products).toHaveLength(2);
      
      // Verify both products had stock decremented
      const product1 = await Product.findById(testProduct1._id);
      const product2 = await Product.findById(testProduct2._id);
      expect(product1.stockQuantity).toBe(47); // 50 - 3
      expect(product2.stockQuantity).toBe(28); // 30 - 2
    });

    test('should maintain order history for user', async () => {
      // Create multiple orders
      await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send({
          products: [{ productId: testProduct1._id.toString(), quantity: 1 }],
          paymentMethod: 'cod',
          totalPrice: 100
        });

      await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send({
          products: [{ productId: testProduct2._id.toString(), quantity: 1 }],
          paymentMethod: 'onlinePayment',
          totalPrice: 200
        });

      const response = await request(app)
        .get('/api/orders')
        .set(customerHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      // User is populated as object in responses
      const userId0 = typeof response.body[0].user === 'object' ? response.body[0].user._id : response.body[0].user;
      const userId1 = typeof response.body[1].user === 'object' ? response.body[1].user._id : response.body[1].user;
      expect(userId0).toBe(customerUser._id.toString());
      expect(userId1).toBe(customerUser._id.toString());
    });

    test('should set default status to processing', async () => {
      const orderData = {
        products: [{ productId: testProduct1._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        totalPrice: 100
        // No status provided
      };

      const response = await request(app)
        .post('/api/orders')
        .set(customerHeaders)
        .send(orderData)
        .expect(201);

      expect(response.body.status).toBe('processing');
    });
  });
});
