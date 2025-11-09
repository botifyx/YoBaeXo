# Firebase Configuration Setup Guide

## Getting Your Firebase Configuration Values

To fix the `auth/invalid-api-key` error, you need to set up your actual Firebase project and get your configuration values.

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "yobaexo-music")
4. Accept the terms and click "Create project"
5. Wait for the project to be created

### Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

### Step 3: Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location (choose the one closest to your users)
5. Click "Done"

### Step 4: Get Your Configuration Values

1. Go to Project Settings (gear icon) > General tab
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Register your app with a name (e.g., "yobaexo-web")
5. **Copy the firebaseConfig object** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-example",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 5: Update Your .env File

1. Open `UI/.env` file
2. Replace the placeholder values with your actual Firebase config:

```bash
# Firebase Configuration - Replace with your ACTUAL values
VITE_FIREBASE_API_KEY=AIzaSyC-your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
```

### Step 6: Restart Your Development Server

After updating the .env file, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Razorpay Configuration (Optional for Development)

If you want to test payments, you'll also need Razorpay keys:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a test account
3. Go to Settings > API Keys
4. Copy your Test Key ID and Test Key Secret
5. Update the VITE_RAZORPAY_KEY_ID in your .env file

## Environment File Structure

Your final `UI/.env` file should look like this:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC-your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Razorpay Configuration (Optional)
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
```

## Troubleshooting

### Error: "auth/invalid-api-key"
- Check that your VITE_FIREBASE_API_KEY is correct
- Ensure there are no extra spaces in the .env file
- Restart the dev server after making changes

### Error: "Firebase project not found"
- Verify your VITE_FIREBASE_PROJECT_ID is correct
- Make sure the project exists in your Firebase console

### Error: "Firestore permission denied"
- You may need to set up Firestore security rules
- For development, you can use test mode

## Security Notes

- Never commit your .env file to version control
- The .env file should be in your .gitignore
- Only use production Firebase keys in production