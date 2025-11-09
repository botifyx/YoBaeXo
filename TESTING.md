# Testing Guide - Razorpay Payment Integration

This document provides comprehensive testing instructions for the Razorpay payment integration with Firebase Firestore.

## Pre-Testing Setup

### 1. Environment Configuration

Ensure all environment variables are properly configured:

#### Frontend (.env)
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

#### Backend (Vercel Environment Variables)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_email%40project.iam.gserviceaccount.com
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Test Scenarios

### 1. User Registration Test

**Steps:**
1. Navigate to the login/registration page
2. Click "Register" or "Sign Up"
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123"
4. Click "Register"

**Expected Results:**
- User is created in Firebase Authentication
- User data is stored in Firestore `users` collection
- Email verification is sent
- User is redirected to login page or automatically logged in

**Database Verification:**
Check Firestore `users` collection for:
```json
{
  "uid": "generated_uid",
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "timestamp",
  "licenseStatus": "free"
}
```

### 2. User Login Test

**Steps:**
1. Navigate to login page
2. Enter the credentials from registration test
3. Click "Login"

**Expected Results:**
- User is authenticated via Firebase Auth
- User data is fetched from Firestore
- JWT token is generated
- User is redirected to dashboard/home page

### 3. Payment Flow Test

**Prerequisites:** User must be logged in

**Steps:**
1. Navigate to Licensing page
2. Select "Basic License" (₹999) or "Pro License" (₹2999)
3. Click "Purchase License"
4. Complete Razorpay checkout with test card:
   - Card Number: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: `Test User`
5. Complete payment

**Expected Results:**
1. **Order Creation:** `/api/create-order` is called successfully
   - Returns: `order_id`, `amount`, `currency`, `key_id`

2. **Payment Processing:** Razorpay checkout opens with correct details

3. **Payment Verification:** `/api/verify-payment` is called with:
   - `order_id`, `payment_id`, `signature`, `amount`, `currency`

4. **Database Updates:**
   - Payment record created in `payments` collection
   - User's `licenseStatus` updated to "active" in `users` collection

5. **Success Message:** "Payment successful! Your [Plan Name] has been activated"

**Database Verification:**

**Payments Collection:**
```json
{
  "userId": "user_uid",
  "orderId": "order_123",
  "paymentId": "pay_456",
  "amount": 99900,  // in paise
  "currency": "INR",
  "status": "completed",
  "createdAt": "timestamp",
  "receipt": "receipt_basic_123"
}
```

**Users Collection:**
```json
{
  "uid": "user_uid",
  "licenseStatus": "active",  // Changed from "free"
  "updatedAt": "timestamp"
}
```

### 4. Payment History Test

**Steps:**
1. Navigate to Payment History page (if exists)
2. View payment history

**Expected Results:**
- `/api/payment-history` is called with user authentication
- User's payment history is fetched from `payments` collection
- Payments are displayed with:
  - Order ID (last 8 characters)
  - Payment ID
  - Amount
  - Currency
  - Status
  - Date
  - Download receipt option

**API Response:**
```json
{
  "success": true,
  "payments": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalPayments": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Error Testing

### 1. Invalid Payment Test

**Steps:**
1. Attempt payment with test card: `4000 0000 0000 0002`
2. Use same CVV and expiry

**Expected Results:**
- Payment fails in Razorpay
- Error message displayed: "Payment failed. Please try again"
- No database records created
- User remains on licensing page

### 2. Authentication Error Test

**Steps:**
1. Clear browser local storage/session
2. Attempt to access payment functionality
3. Try to create order without authentication

**Expected Results:**
- User is redirected to login page
- Or error message: "Please log in to purchase a license"
- API calls fail with 401 Unauthorized

### 3. Network Error Test

**Steps:**
1. Disconnect internet during payment
2. Attempt payment

**Expected Results:**
- Network error handling displays appropriate message
- No duplicate orders created
- User can retry payment

## Performance Testing

### 1. Concurrent Users Test

**Steps:**
1. Simulate multiple users registering and making payments
2. Monitor API response times
3. Check for race conditions

**Expected Results:**
- No data corruption
- All payments recorded correctly
- Response times under 2 seconds

### 2. Large Dataset Test

**Steps:**
1. Create 100+ test payments for a user
2. Test payment history pagination

**Expected Results:**
- Pagination works correctly
- Load times remain acceptable
- No memory issues

## Security Testing

### 1. API Security Test

**Steps:**
1. Try to access `/api/payment-history` without authentication
2. Try to access another user's payment data
3. Try to verify payment with wrong signature

**Expected Results:**
- 401 Unauthorized for unauthenticated requests
- 403 Forbidden for accessing other user's data
- 400 Bad Request for invalid signatures

### 2. Data Validation Test

**Steps:**
1. Try to create order with negative amount
2. Try to create order with very large amount
3. Try to manipulate payment amount on frontend

**Expected Results:**
- Input validation prevents invalid amounts
- Server-side validation ensures security
- Tampered amounts are rejected

## Testing Checklist

- [ ] User registration works correctly
- [ ] User login works correctly
- [ ] Payment order creation succeeds
- [ ] Payment verification works
- [ ] Database records are created
- [ ] User license status is updated
- [ ] Payment history displays correctly
- [ ] Error handling works
- [ ] Authentication is enforced
- [ ] Security validations pass
- [ ] Performance is acceptable

## Automated Testing Commands

### Local Development Testing

```bash
# Start development servers
npm run dev                    # Frontend
vercel dev                     # Backend

# Run tests (if implemented)
npm test                       # Frontend tests
```

### Production Testing

```bash
# Deploy to Vercel
vercel --prod

# Test production deployment
curl -X GET https://your-domain.vercel.app/api/health
```

## Troubleshooting Common Issues

### 1. CORS Errors
- Ensure both frontend and backend are on same domain in production
- Check CORS configuration in API routes

### 2. Firebase Connection Issues
- Verify service account permissions
- Check environment variables
- Ensure Firestore rules allow access

### 3. Payment Failures
- Verify Razorpay test keys
- Check webhook configuration
- Ensure payment amount is in paise (multiply by 100)

### 4. Authentication Issues
- Clear browser cache
- Check Firebase Auth configuration
- Verify ID token generation

## Test Data

### Sample Users
```
Email: test1@example.com
Password: TestPassword123

Email: test2@example.com  
Password: TestPassword456
```

### Sample Payments
```
Test Card: 4111 1111 1111 1111
Amount: ₹999 (Basic License)
Amount: ₹2999 (Pro License)
```

This testing guide ensures all functionality works correctly before production deployment.