import { useState, useCallback } from 'react';
import { razorpayService, PaymentDetails, LicenseActivationResponse } from '../services/razorpay';
import { useToastHelpers } from '../components/Toast';
import { useAuth } from '../lib/auth';

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

  const { getAuthToken } = useAuth();
  const toast = useToastHelpers();

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: null }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false, isProcessing: false }));
    
    // Show error toast notification
    toast.error('Payment Failed', error);
    
    options.onPaymentError?.(error);
  }, [options, toast]);

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
    
    // Show success toast notification
    toast.success('Payment Successful!', `Your ${paymentDetails.planName} license has been activated successfully.`);
    
    options.onPaymentSuccess?.(paymentDetails, licenseDetails);
  }, [options, toast]);

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
      // Show loading toast
      toast.loading('Initializing Payment', 'Setting up secure payment gateway...');
      
      setLoading(true);

      // Validate configuration
      const config = razorpayService.validateConfiguration();
      if (!config.isValid) {
        throw new Error(config.errors.join(', '));
      }

      // Check if Razorpay script is loaded
      if (!razorpayService.isScriptLoaded()) {
        toast.info('Loading Payment Gateway', 'Please wait while we prepare secure payment options...');
        await razorpayService.loadRazorpayScript();
      }

      // Create order
      setProcessing(true);
      toast.loading('Creating Order', 'Generating your payment order...');
      
      const order = await razorpayService.createOrder(orderData);

      // Track payment initiation
      try {
        const authToken = await getAuthToken();
        if (authToken) {
          await fetch('/api/track-payment', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order_id: order.id,
              amount: orderData.amount,
              currency: orderData.currency,
              plan_id: orderData.planId,
              plan_name: orderData.planName,
              status: 'initiated'
            })
          });
        }
      } catch (trackingError) {
        console.warn('Failed to track payment initiation:', trackingError);
        // Continue with payment even if tracking fails
      }

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
            toast.loading('Processing Payment', 'Verifying your payment transaction...');

            const paymentDetails: PaymentDetails = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: orderData.amount,
              currency: orderData.currency,
              plan: orderData.planId,
              planName: orderData.planName,
            };

            // Update payment status to processing
            try {
              const authToken = await getAuthToken();
              if (authToken) {
                await fetch('/api/track-payment', {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    order_id: order.id,
                    status: 'processing',
                    payment_details: {
                      paymentId: response.razorpay_payment_id,
                      signature: response.razorpay_signature
                    }
                  })
                });
              }
            } catch (trackingError) {
              console.warn('Failed to track payment processing:', trackingError);
            }

            // Verify signature
            if (!razorpayService.verifyPaymentSignature(paymentDetails)) {
              throw new Error('Payment signature verification failed');
            }

            // Activate license
            toast.loading('Activating License', 'Enabling your premium features...');
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
            toast.info('Payment Cancelled', 'You cancelled the payment process');
            options.onPaymentCancel?.();
            
            // Track payment cancellation
            try {
              (async () => {
                const authToken = await getAuthToken();
                if (authToken) {
                  fetch('/api/track-payment', {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      order_id: order.id,
                      status: 'cancelled',
                      error_message: 'User cancelled payment'
                    })
                  });
                }
              })();
            } catch (trackingError) {
              console.warn('Failed to track payment cancellation:', trackingError);
            }
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
        
        // Track payment failure
        try {
          (async () => {
            const authToken = await getAuthToken();
            if (authToken) {
              fetch('/api/track-payment', {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  order_id: order.id,
                  status: 'failed',
                  error_message: errorMessage
                })
              });
            }
          })();
        } catch (trackingError) {
          console.warn('Failed to track payment failure:', trackingError);
        }
      });

      rzp.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
      setError(errorMessage);
    }
  }, [setLoading, setProcessing, setError, setSuccess, options, toast]);

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