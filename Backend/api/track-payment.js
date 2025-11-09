const { verifyToken, db } = require('../firebase-config');

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept,Accept-Language,Authorization,Cache-Control,cache-control,Content-Type,Content-Length,Origin,Pragma,Expires,X-Requested-With,X-Auth-Token,X-CSRF-Token,X-Api-Key,If-None-Match,If-Modified-Since,Range,User-Agent,Referer,Accept-Encoding,Accept-Data,Connection,Host,Sec-Fetch-Mode,Sec-Fetch-Site,Sec-Fetch-User,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
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

  // Allow both POST (for tracking) and GET (for status updates)
  if (!['POST', 'GET', 'PUT'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For GET requests (webhook updates), skip auth
    let decodedToken = null;
    if (req.method !== 'GET') {
      decodedToken = await verifyToken(req);
    }

    const { action } = req.query;
    
    if (req.method === 'POST' || (req.method === 'GET' && action === 'create')) {
      // Track payment initiation or creation
      const { 
        order_id, 
        amount, 
        currency = 'INR',
        plan_id,
        plan_name,
        status = 'initiated',
        error_message
      } = req.body;

      // Validate required fields
      if (!order_id || !amount) {
        return res.status(400).json({ error: 'order_id and amount are required' });
      }

      // Check if payment record already exists
      const existingPaymentQuery = await db.collection('payments')
        .where('orderId', '==', order_id)
        .limit(1)
        .get();

      let paymentData = {
        userId: decodedToken.uid,
        orderId: order_id,
        amount: amount,
        currency: currency,
        status: status,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan_id: plan_id || null,
        plan_name: plan_name || 'Music License',
        paymentId: null,
        receipt: null,
        notes: {}
      };

      if (error_message) {
        paymentData.error_message = error_message;
        paymentData.error_timestamp = new Date();
      }

      let paymentRef;
      
      if (!existingPaymentQuery.empty) {
        // Update existing payment
        paymentRef = existingPaymentQuery.docs[0].ref;
        await paymentRef.update({
          ...paymentData,
          updatedAt: new Date()
        });
      } else {
        // Create new payment record
        paymentRef = await db.collection('payments').add(paymentData);
      }

      res.status(200).json({
        success: true,
        message: 'Payment tracked successfully',
        payment_id: paymentRef.id,
        status: status
      });

    } else if (req.method === 'PUT' || (req.method === 'GET' && action === 'update')) {
      // Update payment status
      const { 
        order_id, 
        payment_id,
        status,
        error_message,
        payment_details = {},
        license_details = {}
      } = req.body;

      if (!order_id || !status) {
        return res.status(400).json({ error: 'order_id and status are required' });
      }

      // Find payment by order_id or payment_id
      let paymentQuery;
      if (order_id) {
        paymentQuery = await db.collection('payments')
          .where('orderId', '==', order_id)
          .limit(1)
          .get();
      } else if (payment_id) {
        paymentQuery = await db.collection('payments')
          .where('paymentId', '==', payment_id)
          .limit(1)
          .get();
      }

      if (paymentQuery.empty) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const paymentRef = paymentQuery.docs[0].ref;
      const updateData = {
        status: status,
        updatedAt: new Date(),
        ...payment_details,
        ...license_details
      };

      if (error_message) {
        updateData.error_message = error_message;
        updateData.error_timestamp = new Date();
      }

      await paymentRef.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        payment_id: paymentRef.id,
        status: status
      });

    } else if (req.method === 'GET') {
      // Get payment status
      const { order_id, payment_id } = req.query;

      if (!order_id && !payment_id) {
        return res.status(400).json({ error: 'order_id or payment_id is required' });
      }

      let paymentQuery;
      if (order_id) {
        paymentQuery = await db.collection('payments')
          .where('orderId', '==', order_id)
          .limit(1)
          .get();
      } else if (payment_id) {
        paymentQuery = await db.collection('payments')
          .where('paymentId', '==', payment_id)
          .limit(1)
          .get();
      }

      if (paymentQuery.empty) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const paymentDoc = paymentQuery.docs[0];
      const payment = paymentDoc.data();

      res.status(200).json({
        success: true,
        payment: {
          id: paymentDoc.id,
          ...payment,
          createdAt: payment.createdAt ? payment.createdAt.toDate().toISOString() : null,
          updatedAt: payment.updatedAt ? payment.updatedAt.toDate().toISOString() : null
        }
      });
    }

  } catch (error) {
    console.error('Track payment error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process payment tracking', 
      message: error.message 
    });
  }
};