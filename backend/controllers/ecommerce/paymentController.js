const crypto = require('crypto');
const querystring = require('qs');
const Order = require('../../models/ecommerce/order');
const User = require('../../models/auth/user');
const emailService = require('../../services/emailService');
const { secretManager } = require('../../services/secretInitializer');

/**
 * Sort object by key
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Create VNPay payment URL
 */
exports.createVnpayPayment = async (req, res) => {
  try {
    const {
      user,
      products,
      paymentMethod,
      totalPrice,
      subtotal,
      tax,
      taxRate,
      shippingFee,
      shippingLocation,
    } = req.body;

    // Create order first with 'pending' status
    const order = new Order({
      user,
      products,
      paymentMethod,
      orderDate: new Date(),
      status: 'pending', // Will be updated after payment confirmation
      totalPrice,
      subtotal,
      tax,
      taxRate,
      shippingFee,
      shippingLocation,
    });

    await order.save();

    // VNPay configuration - Get from Secret Manager (trim to avoid hidden whitespace)
    const getTrimmed = async (k) => {
      const v = await secretManager.getSecret(k);
      return typeof v === 'string' ? v.trim() : v;
    };
    const vnpTmnCode = await getTrimmed('VNP_TMN_CODE');
    const vnpHashSecret = await getTrimmed('VNP_HASH_SECRET');
    const vnpUrl = await getTrimmed('VNP_URL');
    const vnpReturnUrl = await getTrimmed('VNP_RETURN_URL');

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const orderId = order._id.toString();

  // Convert USD totalPrice to VND using secret exchange rate (VND per 1 USD). Default 24000.
  let exchangeRate = 24000;
  try {
    const exchangeRateSecret = await secretManager.getSecret('VNP_EXCHANGE_RATE');
    exchangeRate = Number(exchangeRateSecret) || 24000;
  } catch (error) {
    console.warn('⚠️ Using default exchange rate:', exchangeRate);
  }
  const amountVnd = Math.round(Number(totalPrice || 0) * exchangeRate);
  // VNPay requires amount in smallest currency unit (multiply VND by 100)
  const amount = amountVnd * 100;
    const orderInfo = `Payment for order ${orderId}`;
    const orderType = 'other';
    const locale = 'vn';
    const currCode = 'VND';
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpTmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount,
      vnp_ReturnUrl: vnpReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const sortedParams = sortObject(vnpParams);

    // Build hash data from sorted, encoded values (per VNPAY spec). Do NOT include SecureHash/Type.
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret.trim());
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Append signature after signing (omit vnp_SecureHashType for compatibility)
    const signedParams = { ...sortedParams, vnp_SecureHash: signed };

    const paymentUrl = vnpUrl + '?' + querystring.stringify(signedParams, { encode: false });

    if ((process.env.NODE_ENV || 'development') !== 'production') {
      console.log('VNPAY signData:', signData);
      console.log('VNPAY signed (HmacSHA512 hex lower):', signed);
      console.log('VNPAY request params:', signedParams);
    }

    return res.status(200).json({
      url: paymentUrl,
      orderId: orderId,
      amountVnd,
      exchangeRate,
    });
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    return res.status(500).json({
      error: 'Failed to create payment URL',
      message: error.message,
    });
  }
};

/**
 * VNPay return URL handler
 */
exports.vnpReturn = async (req, res) => {
  try {
    let vnpParams = req.query;
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = sortObject(vnpParams);

    const vnpHashSecret = await secretManager.getSecret('VNP_HASH_SECRET');
    const frontendUrl = await secretManager.getSecret('FRONTEND_URL');
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    if ((secureHash || '').toLowerCase() === (signed || '').toLowerCase()) {
      // Valid signature
      if (responseCode === '00') {
        // Payment successful
        await Order.findByIdAndUpdate(orderId, {
          status: 'processing',
          paymentStatus: 'paid',
        });

        // Send order confirmation email
        try {
          const order = await Order.findById(orderId).populate('products.productId').populate('user');
          if (order && order.user && order.user.email) {
            const productsForEmail = order.products.map(item => ({
              name: item.productId.name,
              quantity: item.quantity,
              price: item.price
            }));

            await emailService.sendOrderConfirmation({
              userEmail: order.user.email,
              userName: order.user.username,
              orderId: order._id.toString(),
              orderDate: order.orderDate,
              products: productsForEmail,
              subtotal: order.subtotal || 0,
              tax: order.tax || 0,
              shippingFee: order.shippingFee || 0,
              totalPrice: order.totalPrice,
              paymentMethod: order.paymentMethod
            });
            console.log('✅ Order confirmation email sent for VNPay payment');
          }
        } catch (emailError) {
          console.error('❌ Error sending order confirmation email:', emailError.message);
        }

        // Redirect to success page
        return res.redirect(`${frontendUrl}/customer/orders/order/${orderId}?payment=success`);
      } else {
        // Payment failed
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          paymentStatus: 'failed',
        });

        return res.redirect(`${frontendUrl}/checkout?payment=failed`);
      }
    } else {
      // Invalid signature
      return res.redirect(`${frontendUrl}/checkout?payment=invalid`);
    }
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    const frontendUrl = await secretManager.getSecret('FRONTEND_URL').catch(() => 'http://localhost:5173');
    return res.redirect(`${frontendUrl}/checkout?payment=error`);
  }
};

/**
 * VNPay IPN handler
 */
exports.vnpIpn = async (req, res) => {
  try {
    let vnpParams = req.query;
    const secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = sortObject(vnpParams);

    const vnpHashSecret = await secretManager.getSecret('VNP_HASH_SECRET');
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    if ((secureHash || '').toLowerCase() === (signed || '').toLowerCase()) {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }

      if (responseCode === '00') {
        // Payment successful
        await Order.findByIdAndUpdate(orderId, {
          status: 'processing',
          paymentStatus: 'paid',
        });

        // Send order confirmation email (IPN is more reliable than return URL)
        try {
          const updatedOrder = await Order.findById(orderId).populate('products.productId').populate('user');
          if (updatedOrder && updatedOrder.user && updatedOrder.user.email) {
            const productsForEmail = updatedOrder.products.map(item => ({
              name: item.productId.name,
              quantity: item.quantity,
              price: item.price
            }));

            await emailService.sendOrderConfirmation({
              userEmail: updatedOrder.user.email,
              userName: updatedOrder.user.username,
              orderId: updatedOrder._id.toString(),
              orderDate: updatedOrder.orderDate,
              products: productsForEmail,
              subtotal: updatedOrder.subtotal || 0,
              tax: updatedOrder.tax || 0,
              shippingFee: updatedOrder.shippingFee || 0,
              totalPrice: updatedOrder.totalPrice,
              paymentMethod: updatedOrder.paymentMethod
            });
            console.log('✅ Order confirmation email sent via VNPay IPN');
          }
        } catch (emailError) {
          console.error('❌ Error sending order confirmation email via IPN:', emailError.message);
        }

        return res.status(200).json({ RspCode: '00', Message: 'Success' });
      } else {
        // Payment failed
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          paymentStatus: 'failed',
        });

        return res.status(200).json({ RspCode: '00', Message: 'Payment failed' });
      }
    } else {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error processing VNPay IPN:', error);
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};


