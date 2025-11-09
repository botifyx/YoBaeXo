// Main API handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url, 'https://api.vercel.com');
  const path = url.pathname;
  const method = req.method;

  try {
    // Route handling
    if (path === '/api/youtube/playlist' && method === 'GET') {
      const playlistHandler = require('./youtube/playlist');
      return await playlistHandler(req, res);
    }
    
    if (path === '/api/youtube/search' && method === 'GET') {
      const searchHandler = require('./youtube/search');
      return await searchHandler(req, res);
    }

    if (path === '/api/youtube/channel-videos' && method === 'GET') {
      const channelVideosHandler = require('./youtube/channel-videos');
      return await channelVideosHandler(req, res);
    }

    if (path.startsWith('/api/youtube/playlist-videos') && method === 'GET') {
      const playlistVideosHandler = require('./youtube/playlist-videos');
      return await playlistVideosHandler(req, res);
    }

    if (path === '/api/login' && method === 'POST') {
      const loginHandler = require('./login');
      return await loginHandler(req, res);
    }

    if (path === '/api/register' && method === 'POST') {
      const registerHandler = require('./register');
      return await registerHandler(req, res);
    }

    if (path === '/api/create-order' && method === 'POST') {
      const createOrderHandler = require('./create-order');
      return await createOrderHandler(req, res);
    }

    if (path === '/api/verify-payment' && method === 'POST') {
      const verifyPaymentHandler = require('./verify-payment');
      return await verifyPaymentHandler(req, res);
    }

    if (path === '/api/payment-history' && method === 'GET') {
      const paymentHistoryHandler = require('./payment-history');
      return await paymentHistoryHandler(req, res);
    }

    if (path === '/api/send-email' && method === 'POST') {
      const sendEmailHandler = require('./send-email');
      return await sendEmailHandler(req, res);
    }

    // If no route matches
    res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};