const bcrypt = require('bcryptjs');
const { admin, db } = require('../firebase-config');

// CORS headers for production
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw error;
    }

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User data not found' });
    }

    const userData = userDoc.data();

    // Verify password by attempting to sign in with Firebase Auth
    try {
      // Try to sign in the user to verify password
      await admin.auth().signInWithEmailAndPassword(email, password);
      // If we get here, both email and password are valid
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw error; // Re-throw other errors
    }

    // Generate a custom token for the session
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Get fresh user data
    const freshUserData = {
      uid: userRecord.uid,
      name: userRecord.displayName,
      email: userRecord.email,
      licenseStatus: userData.licenseStatus || 'free',
      createdAt: userData.createdAt
    };

    res.status(200).json({
      message: 'Login successful',
      user: freshUserData,
      customToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
};