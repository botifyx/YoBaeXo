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

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    return true;
  }
  return false;
}

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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, idToken } = req.body;

    // Validate input
    if (!name || !email || !password || !idToken) {
      return res.status(400).json({ error: 'Name, email, password, and idToken are required' });
    }

    // Verify the ID token to get the user info
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Verify email matches
    if (userEmail !== email) {
      return res.status(400).json({ error: 'Email mismatch' });
    }

    // Check if user already exists in Firestore
    const existingUserDoc = await db.collection('users').doc(uid).get();
    if (existingUserDoc.exists) {
      return res.status(400).json({ error: 'User already registered' });
    }

    // Hash password for additional security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user data in Firestore
    const userData = {
      uid: uid,
      name: name,
      email: email,
      hashedPassword: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      licenseStatus: 'free', // Default status
      emailVerified: decodedToken.email_verified || false,
    };

    await db.collection('users').doc(uid).set(userData);

    // Create a custom token for additional backend operations
    const customToken = await admin.auth().createCustomToken(uid);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: uid,
        name: name,
        email: email,
        licenseStatus: 'free'
      },
      customToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'ID token expired' });
    }
    
    if (error.code === 'auth/id-token-invalid') {
      return res.status(401).json({ error: 'Invalid ID token' });
    }
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
};