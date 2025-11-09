const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Comprehensive CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept,Accept-Language,Authorization,Cache-Control,cache-control,Content-Type,Content-Length,Origin,Pragma,Expires,X-Requested-With,X-Auth-Token,X-CSRF-Token,X-Api-Key,If-None-Match,If-Modified-Since,Range,User-Agent,Referer,Accept-Encoding,Accept-Data,Connection,Host,Sec-Fetch-Mode,Sec-Fetch-Site,Sec-Fetch-User,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

// CORS middleware - applied to all routes
app.use((req, res, next) => {
  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled for origin:', req.headers.origin);
    return res.status(204).send();
  }
  
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/youtube/playlist', require('./api/youtube/playlist'));
app.use('/api/youtube/search', require('./api/youtube/search'));
app.use('/api/youtube/channel-videos', require('./api/youtube/channel-videos'));
app.use('/api/youtube/playlist-videos', require('./api/youtube/playlist-videos'));
app.use('/api/login', require('./api/login'));
app.use('/api/register', require('./api/register'));
app.use('/api/create-order', require('./api/create-order'));
app.use('/api/verify-payment', require('./api/verify-payment'));
app.use('/api/payment-history', require('./api/payment-history'));
app.use('/api/track-payment', require('./api/track-payment'));
app.use('/api/payment-webhook', require('./api/payment-webhook'));
app.use('/api/send-email', require('./api/send-email'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint for payment (without auth)
app.post('/api/test-create-order', (req, res) => {
  console.log('Test endpoint called:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for development origins');
  console.log('Allowed origins: http://localhost:5173, http://localhost:3000, http://localhost:4173, http://127.0.0.1:5173, http://127.0.0.1:3000');
});