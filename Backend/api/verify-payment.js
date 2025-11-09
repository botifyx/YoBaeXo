const Razorpay = require('razorpay');
const crypto = require('crypto');
const { admin, verifyToken, db } = require('../firebase-config');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CORS headers (mirroring server.js)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept,Accept-Language,Authorization,Cache-Control,cache-control,Content-Type,Content-Length,Origin,Pragma,Expires,X-Requested-With,X-Auth-Token,X-CSRF-Token,X-Api-Key,If-None-Match,If-Modified-Since,Range,User-Agent,Referer,Accept-Encoding,Accept-Data,Connection,Host,Sec-Fetch-Mode,Sec-Fetch-Site,Sec-Fetch-User,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    return res.status(204).end();
  }

  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    const decodedToken = await verifyToken(req);
    
    const {
      order_id,
      payment_id,
      signature,
      amount,
      currency = 'INR'
    } = req.body;

    // Validate required fields
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        error: 'order_id, payment_id, and signature are required'
      });
    }

    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get order details from Razorpay to confirm
    const order = await razorpay.orders.fetch(order_id);
    
    if (!order || order.status !== 'paid') {
      return res.status(400).json({ error: 'Order not found or not paid' });
    }

    // Update payment status to completed using track-payment logic
    const updateData = {
      paymentId: payment_id,
      status: 'completed',
      payment_details: {
        signature: signature,
        receipt: order.receipt,
        verified_at: new Date()
      },
      license_details: {
        license_status: 'active',
        activated_at: new Date()
      }
    };

    // Try to update existing payment or create new one
    const existingPaymentQuery = await db.collection('payments')
      .where('orderId', '==', order_id)
      .limit(1)
      .get();

    let paymentRef;
    if (existingPaymentQuery.empty) {
      // Create new payment record
      const paymentData = {
        userId: decodedToken.uid,
        orderId: order_id,
        paymentId: payment_id,
        amount: order.amount,
        currency: order.currency,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        plan_name: 'Music License',
        ...updateData.payment_details,
        ...updateData.license_details
      };
      paymentRef = await db.collection('payments').add(paymentData);
    } else {
      // Update existing payment
      paymentRef = existingPaymentQuery.docs[0].ref;
      await paymentRef.update({
        ...updateData,
        updatedAt: new Date()
      });
    }

    // Update user's license status
    await db.collection('users').doc(decodedToken.uid).update({
      licenseStatus: 'active',
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      paymentId: paymentRef.id,
      orderDetails: {
        order_id: order_id,
        payment_id: payment_id,
        amount: order.amount,
        currency: order.currency,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
};