import { useState, useCallback } from 'react';
import { razorpayService, PaymentDetails, LicenseActivationResponse } from '../services/razorpay';
import { useToastHelpers } from '../components/Toast';

export interface PaymentState {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  paymentDetails: PaymentDetails | null;
  licenseDetails: LicenseActivationResponse | null;
}

export interface UseRazorpayPaymentOptions {
  onPaymentSuccess?: (details: PaymentDetails, license: LicenseActivationResponse) => void;
  onPaymentError?: (error: string) => void;
  onPaymentCancel?: () => void;
}

export const useRazorpayPayment = (options: UseRazorpayPaymentOptions = {}) => {
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isProcessing: false,
    error: null,
    success: false,
    paymentDetails: null,
    licenseDetails: null,
  });

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: null }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false, isProcessing: false }));
    options.onPaymentError?.(error);
  }, [options]);

  const setSuccess = useCallback((paymentDetails: PaymentDetails, licenseDetails: LicenseActivationResponse) => {
    setState(prev => ({
      ...prev,
      success: true,
      paymentDetails,
      licenseDetails,
      isLoading: false,
      isProcessing: false,
      error: null,
    }));
    options.onPaymentSuccess?.(paymentDetails, licenseDetails);
  }, [options]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      isProcessing: false,
      error: null,
      success: false,
      paymentDetails: null,
      licenseDetails: null,
    });
  }, []);

  const processPayment = useCallback(async (orderData: {
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    customerInfo?: {
      name: string;
      email: string;
      contact: string;
    };
  }) => {
    try {
      setLoading(true);

      // Validate configuration
      const config = razorpayService.validateConfiguration();
      if (!config.isValid) {
        throw new Error(config.errors.join(', '));
      }

      // Check if Razorpay script is loaded
      if (!razorpayService.isScriptLoaded()) {
        await razorpayService.loadRazorpayScript();
      }

      // Create order
      setProcessing(true);
      const order = await razorpayService.createOrder(orderData);

      // Initialize Razorpay
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      const rzpOptions = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'YoBaeXo Music',
        description: `License for ${orderData.planName}`,
        order_id: order.id,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            setProcessing(true);

            const paymentDetails: PaymentDetails = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency,
              plan: orderData.planId,
              planName: orderData.planName,
            };

            // Verify signature
            if (!razorpayService.verifyPaymentSignature(paymentDetails)) {
              throw new Error('Payment signature verification failed');
            }

            // Activate license
            const licenseDetails = await razorpayService.activateLicense(paymentDetails);
            setSuccess(paymentDetails, licenseDetails);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
            setError(errorMessage);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setProcessing(false);
            options.onPaymentCancel?.();
          },
        },
        prefill: orderData.customerInfo,
        theme: {
          color: '#F37254',
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions); // eslint-disable-line @typescript-eslint/no-explicit-any

      rzp.on('payment.failed', (response: { error?: { description?: string } }) => {
        const errorMessage = response.error?.description || 'Payment failed';
        setError(errorMessage);
      });

      rzp.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
    }
  }, [setLoading, setProcessing, setError, setSuccess, options]);

  return {
    // State
    isLoading: state.isLoading,
    isProcessing: state.isProcessing,
    error: state.error,
    success: state.success,
    paymentDetails: state.paymentDetails,
    licenseDetails: state.licenseDetails,
    
    // Actions
    processPayment,
    clearError,
    resetState,
  };
};