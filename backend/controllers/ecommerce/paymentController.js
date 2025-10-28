const crypto = require('crypto');
const querystring = require('qs');
const Order = require('../../models/ecommerce/order');

/**
 * Sort object by key
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
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

    // VNPay configuration
    const vnpTmnCode = process.env.VNP_TMN_CODE;
    const vnpHashSecret = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const vnpReturnUrl = process.env.VNP_RETURN_URL;

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const orderId = order._id.toString();

  // Convert USD totalPrice to VND using env exchange rate (VND per 1 USD). Default 24000.
  const exchangeRate = Number(process.env.VNP_EXCHANGE_RATE) || 24000;
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

    vnpParams = sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + querystring.stringify(vnpParams, { encode: false });

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

    const vnpHashSecret = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    if (secureHash === signed) {
      // Valid signature
      if (responseCode === '00') {
        // Payment successful
        await Order.findByIdAndUpdate(orderId, {
          status: 'processing',
          paymentStatus: 'paid',
        });

        // Redirect to success page
        return res.redirect(`${process.env.FRONTEND_URL}/customer/orders/order/${orderId}?payment=success`);
      } else {
        // Payment failed
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          paymentStatus: 'failed',
        });

        return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=failed`);
      }
    } else {
      // Invalid signature
      return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=invalid`);
    }
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=error`);
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

    const vnpHashSecret = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const orderId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    if (secureHash === signed) {
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


