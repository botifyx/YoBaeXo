# YoBaeXo Music Platform - Complete Setup Guide

This guide will help you set up the complete Razorpay payment integration with Firebase Firestore for the YoBaeXo music platform.

## Prerequisites

- Node.js 18+ installed
- Firebase project with Firestore enabled
- Razorpay account with API keys
- Vercel account for deployment

## Environment Setup

### 1. Frontend Environment Variables

Create a `.env` file in the `UI/` directory based on `.env.example`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 2. Backend Environment Configuration

#### Local Development
Create a `.env` file in the `Backend/` directory based on `Backend/.env.example`:

```bash
cd Backend
cp .env.example .env
# Then edit .env with your actual values
```

#### Vercel Deployment
In your Vercel dashboard, set these environment variables:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project_id.iam.gserviceaccount.com

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# EmailJS Configuration
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
CONTACT_EMAIL=info@yobaexo.com

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id
```

**Note:** The backend includes `Backend/vercel.json` for proper serverless function deployment configuration.
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password provider
4. Enable Firestore Database

### 2. Generate Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for your Vercel environment variables

### 3. Set up Firestore Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read their own payment history
    match /payments/{paymentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Only server can write payments
    }
  }
}
```

## Razorpay Setup

### 1. Create Razorpay Account

1. Sign up at [Razorpay](https://razorpay.com/)
2. Complete the onboarding process
3. Get your Test/Live API keys from the dashboard

### 2. Configure Webhooks (Optional)

Set up webhooks in Razorpay dashboard for payment status updates:
- Webhook URL: `https://your-domain.vercel.app/api/webhook`
- Events: `payment.authorized`, `payment.captured`

## Local Development

### 1. Install Dependencies

```bash
# Frontend
cd UI
npm install

# Backend
cd Backend
npm install
```

### 2. Run Development Servers

```bash
# Terminal 1 - Frontend
cd UI
npm run dev

# Terminal 2 - Backend
cd Backend
vercel dev
```

### 3. Test the Flow

1. Register a new user
2. Log in with the user
3. Go to Licensing page
4. Select a plan and make a test payment
5. Check payment history

## Deployment

### 1. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables from `.env.example`
5. Deploy

### 2. Deploy Backend to Vercel

1. The `Backend` folder contains the Vercel serverless functions
2. Deploy the entire project to Vercel
3. The API routes will be available at `/api/*`
4. Set all required environment variables in Vercel dashboard

## API Endpoints

### Authentication Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user (returns custom token)

### Payment Endpoints

- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment and update Firestore
- `GET /api/payment-history` - Get user's payment history

### Email Endpoints

- `POST /api/send-email` - Send contact email via EmailJS

### YouTube Endpoints

- `GET /api/youtube/search` - Search YouTube videos in channel
- `GET /api/youtube/playlist` - Get channel playlists
- `GET /api/youtube/channel-videos` - Get latest channel videos
- `GET /api/youtube/playlist-videos` - Get videos from specific playlist

## Database Structure

### Users Collection
```javascript
{
  uid: "user_id",
  name: "User Name",
  email: "user@example.com",
  createdAt: timestamp,
  licenseStatus: "free" | "active"
}
```

### Payments Collection
```javascript
{
  userId: "user_id",
  orderId: "order_id",
  paymentId: "payment_id",
  amount: 299900, // in paise
  currency: "INR",
  status: "completed",
  createdAt: timestamp,
  receipt: "receipt_id"
}
```

## Testing

### Test Cards for Razorpay

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure both frontend and backend are on the same domain in production
2. **Firebase Auth Errors**: Check service account permissions and API keys
3. **Payment Failures**: Verify Razorpay keys and test with valid test cards
4. **Environment Variables**: Ensure all required variables are set in Vercel

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in Vercel environment variables.

## Security Considerations

1. Never expose Razorpay secret keys in frontend code
2. Use Firebase Security Rules to protect user data
3. Validate all payment data on the server side
4. Implement rate limiting for API endpoints
5. Use HTTPS in production

## Support

For issues related to:
- Firebase: Check [Firebase Documentation](https://firebase.google.com/docs)
- Razorpay: Check [Razorpay Documentation](https://razorpay.com/docs/)
- Vercel: Check [Vercel Documentation](https://vercel.com/docs)