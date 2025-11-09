// ✅ send-email.js (Vercel-compatible, CommonJS-safe)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers':
    'Accept,Accept-Language,Authorization,Cache-Control,cache-control,Content-Type,Content-Length,Origin,Pragma,Expires,X-Requested-With,X-Auth-Token,X-CSRF-Token,X-Api-Key,If-None-Match,If-Modified-Since,Range,User-Agent,Referer,Accept-Encoding,Accept-Data,Connection,Host,Sec-Fetch-Mode,Sec-Fetch-Site,Sec-Fetch-User,Sec-Ch-Ua,Sec-Ch-Ua-Mobile,Sec-Ch-Ua-Platform',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = async (req, res) => {
  // ✅ Handle CORS preflight
  if (handleCors(req, res)) return;

  // ✅ Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Import ESM EmailJS dynamically
    const { default: emailjs } = await import('emailjs/browser');

    const { name, email, subject, category, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !category || !message) {
      return res
        .status(400)
        .json({ error: 'All fields (name, email, subject, category, message) are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // EmailJS configuration
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;

    if (!publicKey || !serviceId || !templateId) {
      console.error('❌ EmailJS credentials missing in environment variables');
      return res
        .status(500)
        .json({ error: 'Email service not configured. Please contact administrator.' });
    }

    // Initialize EmailJS
    emailjs.init(publicKey);

    // Email parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      subject,
      category,
      message,
      time: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' }),
      to_email: process.env.CONTACT_EMAIL || 'info@yobaexo.com'
    };

    // Send email
    const result = await emailjs.send(serviceId, templateId, templateParams);

    console.log(`✅ Email sent: ${result.status} - ${result.text}`);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      emailId: result.text
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);

    if (error.status) {
      switch (error.status) {
        case 400:
          return res.status(400).json({ error: 'Invalid email data or template configuration' });
        case 401:
          return res.status(500).json({ error: 'Email service authentication failed' });
        case 403:
          return res.status(500).json({ error: 'Email service access forbidden' });
        case 429:
          return res
            .status(429)
            .json({ error: 'Too many email requests. Please try again later.' });
        default:
          break;
      }
    }

    return res.status(500).json({
      error: 'Failed to send email',
      message:
        process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while sending email'
    });
  }
};
