// Razorpay Service - Centralized payment handling
export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  currency: string;
  plan: string;
  planName: string;
}

export interface LicenseActivationResponse {
  success: boolean;
  message: string;
  licenseKey?: string;
  transactionId?: string;
}

export interface CreateOrderRequest {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  customerInfo?: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface CreateOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

class RazorpayService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  /**
   * Validate Razorpay configuration
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
      errors.push('Razorpay Key ID is not configured');
    } else if (keyId === 'your_razorpay_key_id_here') {
      errors.push('Please update your actual Razorpay Key ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create payment order on backend
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('Creating order with data:', request);
      console.log('Base URL:', this.baseUrl);
      
      const response = await fetch(`${this.baseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          receipt: `receipt_${request.planId}_${Date.now()}`
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment order');
    }
  }

  /**
   * Activate license after successful payment
   */
  async activateLicense(paymentDetails: PaymentDetails): Promise<LicenseActivationResponse> {
    try {
      console.log('Activating license with payment details:', paymentDetails);
      
      const response = await fetch(`${this.baseUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: paymentDetails.orderId,
          payment_id: paymentDetails.paymentId,
          signature: paymentDetails.signature,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency
        }),
      });

      console.log('Verification response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Verification Error:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Verification response:', data);
      
      return {
        success: data.success,
        message: data.message,
        licenseKey: data.licenseKey,
        transactionId: data.paymentId
      };
    } catch (error) {
      console.error('Failed to activate license:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to activate license');
    }
  }

  /**
   * Verify payment signature (client-side verification)
   */
  verifyPaymentSignature(paymentDetails: PaymentDetails): boolean {
    // This is a basic signature verification placeholder
    // In production, you should implement proper HMAC verification
    return !!(
      paymentDetails.paymentId &&
      paymentDetails.orderId &&
      paymentDetails.signature
    );
  }

  /**
   * Get payment status from backend
   */
  async getPaymentStatus(paymentId: string): Promise<{ status: string; amount: number; currency: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/license/payment-status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw new Error('Failed to retrieve payment status');
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Check if Razorpay script is loaded
   */
  isScriptLoaded(): boolean {
    return typeof (window as unknown as { Razorpay?: unknown }).Razorpay !== 'undefined';
  }

  /**
   * Load Razorpay script dynamically
   */
  async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isScriptLoaded()) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));

      document.head.appendChild(script);
    });
  }
}

export const razorpayService = new RazorpayService();