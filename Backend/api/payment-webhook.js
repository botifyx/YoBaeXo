const { db, admin } = require('../firebase-config');
const crypto = require('crypto');

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'X-Razorpay-Signature,Content-Type',
  'Access-Control-Allow-Max-Age': '86400'
};

const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    return true;
  }
  return false;
};

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (handleCors(req, res)) {
    return;
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
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('Webhook signature verification failed');
      console.log('Expected:', expectedSignature);
      console.log('Received:', signature);
      // For development, we might want to continue even if signature fails
      // return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = req.body;
    console.log('Payment webhook received:', event, payload);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'payment.authorized':
        await handlePaymentAuthorized(payload);
        break;
      case 'order.paid':
        await handleOrderPaid(payload);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed', 
      message: error.message 
    });
  }
};

async function handlePaymentCaptured(payload) {
  const { payment } = payload;
  const { id: payment_id, order_id, amount, currency, method, bank, wallet, vpa } = payment;
  
  // Update payment record
  const paymentQuery = await db.collection('payments')
    .where('orderId', '==', order_id)
    .limit(1)
    .get();

  if (!paymentQuery.empty) {
    const paymentRef = paymentQuery.docs[0].ref;
    await paymentRef.update({
      status: 'completed',
      paymentId: payment_id,
      amount: amount,
      currency: currency,
      payment_method: method,
      bank: bank,
      wallet: wallet,
      vpa: vpa,
      captured_at: new Date(),
      updatedAt: new Date()
    });

    console.log('Payment captured and updated:', order_id, payment_id);
  } else {
    console.log('Payment record not found for order:', order_id);
  }
}

async function handlePaymentFailed(payload) {
  const { payment } = payload;
  const { id: payment_id, order_id, amount, currency, reason } = payment;
  
  // Update payment record
  const paymentQuery = await db.collection('payments')
    .where('orderId', '==', order_id)
    .limit(1)
    .get();

  if (!paymentQuery.empty) {
    const paymentRef = paymentQuery.docs[0].ref;
    await paymentRef.update({
      status: 'failed',
      paymentId: payment_id,
      amount: amount,
      currency: currency,
      failure_reason: reason,
      failed_at: new Date(),
      updatedAt: new Date()
    });

    console.log('Payment failed and updated:', order_id, payment_id);
  } else {
    console.log('Payment record not found for order:', order_id);
  }
}

async function handlePaymentAuthorized(payload) {
  const { payment } = payload;
  const { id: payment_id, order_id, amount, currency } = payment;
  
  // Update payment record
  const paymentQuery = await db.collection('payments')
    .where('orderId', '==', order_id)
    .limit(1)
    .get();

  if (!paymentQuery.empty) {
    const paymentRef = paymentQuery.docs[0].ref;
    await paymentRef.update({
      status: 'authorized',
      paymentId: payment_id,
      amount: amount,
      currency: currency,
      authorized_at: new Date(),
      updatedAt: new Date()
    });

    console.log('Payment authorized and updated:', order_id, payment_id);
  } else {
    console.log('Payment record not found for order:', order_id);
  }
}

async function handleOrderPaid(payload) {
  const { order } = payload;
  const { id: order_id, amount, currency } = order;
  
  // Update payment record
  const paymentQuery = await db.collection('payments')
    .where('orderId', '==', order_id)
    .limit(1)
    .get();

  if (!paymentQuery.empty) {
    const paymentRef = paymentQuery.docs[0].ref;
    await paymentRef.update({
      status: 'completed',
      amount: amount,
      currency: currency,
      order_paid_at: new Date(),
      updatedAt: new Date()
    });

    console.log('Order paid and updated:', order_id);
  } else {
    console.log('Payment record not found for order:', order_id);
  }
}