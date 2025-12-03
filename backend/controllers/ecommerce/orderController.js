const Order = require("../../models/ecommerce/order");
const Product = require("../../models/ecommerce/product");
const User = require("../../models/auth/user");
const emailService = require("../../services/emailService");

// Admin Operation: Get all Orders
exports.getAllOrders = async (req, res) => {
  const user = req.user;

  if (user.role == "admin") {
    try {
      const orders = await Order.find().populate("user").populate("products.productId");
      return res.json(orders);
    } catch (err) {
      return res.status(500).send("Server Error");
    }
  } else {
    try {
      const orders = await Order.find({ user: user.id }).populate("user").populate("products.productId");
      return res.json(orders);
    } catch (err) {
      return res.status(500).send("Server Error");
    }
  }
};

// User Operation: Create an Order
exports.createOrder = async (req, res) => {
  console.log('\n========== CREATE ORDER START ==========');
  console.log('📦 Request received at:', new Date().toISOString());
  console.log('📦 Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { products, paymentMethod, status, totalPrice } = req.body;
    console.log("✅ Products from request body:", products);
    console.log("✅ Payment method from request body:", paymentMethod);
    console.log("✅ Status from request body:", status);
    console.log("✅ Total price from request body:", totalPrice);

    if (!products || !paymentMethod || !totalPrice) {
      console.log('❌ Missing required fields');
      console.log('   - products:', !!products);
      console.log('   - paymentMethod:', !!paymentMethod);
      console.log('   - totalPrice:', !!totalPrice);
      return res.status(400).send({ error: 'Products, payment method, and total price are required' });
    }

    const userId = req.user.id;
    console.log("✅ User ID from request:", userId);
    console.log("✅ User details:", JSON.stringify(req.user, null, 2));

    // Validate stock for each product line and enrich with price
    console.log('\n--- Validating and enriching products ---');
    const enrichedProducts = [];
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      console.log(`\n📦 Processing product ${i + 1}/${products.length}:`, item);
      
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        console.log(`❌ Invalid product data at index ${i}:`, item);
        return res.status(400).send({ error: 'Each product requires productId and positive quantity' });
      }
      
      console.log(`   Fetching product details for ID: ${item.productId}`);
      const product = await Product.findById(item.productId);
      
      if (!product) {
        console.log(`❌ Product not found: ${item.productId}`);
        return res.status(400).send({ error: `Product not found: ${item.productId}` });
      }
      
      console.log(`   ✅ Product found:`, {
        id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stockQuantity
      });
      
      if (product.stockQuantity < item.quantity) {
        console.log(`❌ Insufficient stock for ${product.name}`);
        console.log(`   Available: ${product.stockQuantity}, Requested: ${item.quantity}`);
        return res.status(400).send({
          error: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, requested: ${item.quantity}`,
        });
      }
      
      // Add the price from the product if not provided
      const enrichedItem = {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || product.price,
      };
      console.log(`   ✅ Enriched product:`, enrichedItem);
      enrichedProducts.push(enrichedItem);
    }

    console.log('\n✅ All products validated and enriched:', enrichedProducts);

    // Decrement stock atomically per item
    console.log('\n--- Updating stock quantities ---');
    for (let i = 0; i < enrichedProducts.length; i++) {
      const item = enrichedProducts[i];
      console.log(`\n📦 Updating stock for product ${i + 1}/${enrichedProducts.length}`);
      console.log(`   Product ID: ${item.productId}`);
      console.log(`   Decrementing by: ${item.quantity}`);
      
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
      
      if (!updated) {
        console.log(`❌ Stock update failed - concurrent modification detected`);
        return res.status(409).send({
          error: 'Stock changed while processing your order. Please try again.',
        });
      }
      
      console.log(`   ✅ Stock updated. New stock: ${updated.stockQuantity}`);
    }

    console.log('\n--- Creating order document ---');
    const order = new Order({
      user: userId,
      products: enrichedProducts,
      paymentMethod,
      status: status || "processing",
      totalPrice,
      orderDate: new Date(),
    });

    console.log('💾 Saving order to database...');
    await order.save();
    console.log("✅ Order saved successfully!");
    console.log("   Order ID:", order._id);
    console.log("   Order details:", JSON.stringify(order, null, 2));
    
    // Send order confirmation email
    console.log('\n--- Sending order confirmation email ---');
    try {
      const userDetails = await User.findById(userId).select('email username');
      if (userDetails && userDetails.email) {
        // Populate product details for email
        const populatedOrder = await Order.findById(order._id).populate('products.productId');
        const productsForEmail = populatedOrder.products.map(item => ({
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price
        }));

        const emailResult = await emailService.sendOrderConfirmation({
          userEmail: userDetails.email,
          userName: userDetails.username,
          orderId: order._id.toString(),
          orderDate: order.orderDate,
          products: productsForEmail,
          subtotal: enrichedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: req.body.tax || 0,
          shippingFee: req.body.shippingFee || 0,
          totalPrice: order.totalPrice,
          paymentMethod: order.paymentMethod
        });

        if (emailResult.success) {
          console.log('✅ Order confirmation email sent successfully');
        } else {
          console.warn('⚠️ Failed to send order confirmation email, but order was created successfully');
        }
      } else {
        console.warn('⚠️ User email not found, skipping order confirmation email');
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError.message);
      console.warn('⚠️ Order was created successfully, but email failed to send');
    }
    
    console.log('\n========== CREATE ORDER SUCCESS ==========\n');
    res.status(201).send(order);
  } catch (error) {
    console.error('\n❌❌❌ ERROR IN CREATE ORDER ❌❌❌');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('========== CREATE ORDER FAILED ==========\n');
    res.status(500).send({ error: 'Internal Server Error', details: error.message });
  }
};

// User Operation: Update Order Status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    console.log("Order ID:", orderId);
    console.log("New status:", status);

    const userId = req.user.id;
    console.log("User ID:", userId);

    const user = req.user;
    console.log("User:", user);

    // Define the query
    let query = { _id: orderId };
    if (user.role !== 'admin') {
      query.user = userId;
    }
    
    const order = await Order.findOneAndUpdate(query, { status }, { new: true });

    if (order) {
      console.log("Order status updated successfully:", order);
      
      res.json(order);
    } else {
      console.log("Order not found");
      res.status(404).send("Order not found");
    }
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send("Server Error");
  }
};

// User Operation: Delete an Order
exports.deleteOrderByCustomer = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    console.log("Order ID:", orderId);
    console.log("User ID:", userId);

    const order = await Order.findOneAndDelete({ _id: orderId, user: userId });

    if (order) {
      console.log("Order deleted successfully:", order);
      res.status(204).send();
    } else {
      console.log("Order not found");
      res.status(404).send("Order not found");
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).send("Server Error");
  }
};

// User Operation: Delete an Order
exports.deleteOrderByAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log("Order ID:", orderId);

    const order = await Order.findOneAndDelete({ _id: orderId });

    if (order) {
      console.log("Order deleted successfully:", order);
      res.status(204).send();
    } else {
      console.log("Order not found");
      res.status(404).send("Order not found");
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).send("Server Error");
  }
};

// User Operation: Get all Orders by Username or User ID
exports.getOrdersByUser = async (req, res) => {
  try {
    const { id, username } = req.query;

    let user;
    if (id) {
      user = await User.findById(id);
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const orders = await Order.find({ user: user._id }).populate("products.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// User Operation: Get an Order by OrderID
exports.getOrderByOrderId = async (req, res) => {
  try {
    const orderId = req.params.id;

    console.log("Order ID:", orderId);

    const order = await Order.findOne({ _id: orderId }).populate("products.productId");

    if (order) {
      console.log("Order retrieved successfully:", order);
      res.json(order);
    } else {
      console.log("Order not found");
      res.status(404).send("Order not found");
    }
  } catch (err) {
    console.error("Error retrieving order:", err);
    res.status(500).send("Server Error");
  }
};

// User Operation: Get all Orders by User ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const orders = await Order.find({ user: user._id }).populate("products.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};