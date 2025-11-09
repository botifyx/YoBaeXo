const { verifyToken, db } = require('../firebase-config');

// CORS headers for Vercel production
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept,Accept-Language,Authorization,Cache-Control,cache-control,Content-Type,Content-Length,Origin,Pragma,Expires,X-Requested-With,X-Auth-Token,X-CSRF-Token,X-Api-Key,If-None-Match,If-Modified-Since,Range,User-Agent,Referer,Accept-Encoding,Accept-Data,Connection,Host,Sec-Fetch-Mode,Sec-Fetch-Site,Sec-Fetch-User,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    return true;
  }
  return false;
}

// Vercel API function handler
module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (handleCors(req, res)) {
    res.status(204).end();
    return;
  }

  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    const decodedToken = await verifyToken(req);

    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build the query
    let paymentsQuery = db.collection('payments')
      .where('userId', '==', decodedToken.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    // For pagination, we need to use startAfter for subsequent pages
    if (page > 1) {
      // Get the last document from the previous page to start after it
      const prevPageQuery = await db.collection('payments')
        .where('userId', '==', decodedToken.uid)
        .orderBy('createdAt', 'desc')
        .limit((page - 1) * limit)
        .get();
      
      const lastDoc = prevPageQuery.docs[prevPageQuery.docs.length - 1];
      if (lastDoc) {
        paymentsQuery = paymentsQuery.startAfter(lastDoc);
      }
    }

    const paymentsSnapshot = await paymentsQuery.get();

    // Get total count for pagination
    const countQuery = await db.collection('payments')
      .where('userId', '==', decodedToken.uid)
      .get();

    const totalPayments = countQuery.size;
    const totalPages = Math.ceil(totalPayments / limit);

    // Process payments data
    const payments = [];
    paymentsSnapshot.forEach((doc) => {
      const payment = doc.data();
      payments.push({
        id: doc.id,
        userId: payment.userId,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        receipt: payment.receipt,
        createdAt: payment.createdAt ? payment.createdAt.toDate().toISOString() : null,
        notes: payment.notes || {}
      });
    });

    res.status(200).json({
      success: true,
      payments: payments,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalPayments: totalPayments,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch payment history', 
      message: error.message 
    });
  }
};