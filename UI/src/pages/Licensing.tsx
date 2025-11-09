import React, { useState, useEffect, useCallback } from 'react';
import { Check, Star, Mail, CreditCard, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getUserLocation, formatCurrency, type CountryInfo } from '../lib/location';

// Define types for better TypeScript support
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Plan {
  id: string;
  name: string;
  prices: {
    INR: number | string;
    USD: number | string;
    EUR: number | string;
    GBP: number | string;
  };
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: PaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    address?: string;
  };
  theme?: {
    color?: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface PaymentNotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface Plan {
  id: string;
  name: string;
  prices: {
    INR: number | string;
    USD: number | string;
    EUR: number | string;
    GBP: number | string;
  };
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
}

// Custom notification component
const PaymentNotification: React.FC<PaymentNotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/50 border-green-500/50 text-green-200';
      case 'error':
        return 'bg-red-900/50 border-red-500/50 text-red-200';
      default:
        return 'bg-blue-900/50 border-blue-500/50 text-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm flex items-center gap-3 min-w-80 max-w-md ${getStyles()}`}>
      {getIcon()}
      <p className="flex-1 text-sm">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Enhanced custom hook to dynamically load the Razorpay script
const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="razorpay.com"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
      setError(null);
    };
    
    script.onerror = () => {
      setError('Failed to load Razorpay checkout. Please check your internet connection.');
      setIsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="razorpay.com"]');
      if (existingScript && !existingScript.parentElement) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return { isLoaded, error };
};

const Licensing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { currentUser, getAuthToken } = useAuth();
const { isLoaded: isRazorpayLoaded, error: razorpayError } = useRazorpay();

  // Detect user location and set currency on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const locationInfo = await getUserLocation();
        setCountryInfo(locationInfo);
        setCurrency(locationInfo.currency);
      } catch (error) {
        console.warn('Failed to detect user location:', error);
        // Use default values
        setCountryInfo({ code: 'IN', name: 'India', currency: 'INR', symbol: '₹' });
        setCurrency('INR');
      }
    };
    
    detectLocation();
  }, []);

  // Helper function to safely get price for a currency
  const getPrice = useCallback((prices: Plan['prices'], curr: Currency): number | string => {
    return prices[curr];
  }, []);

  // Validation function for environment variables
  const validateEnvironmentVariables = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!keyId) {
      errors.push({ field: 'VITE_RAZORPAY_KEY_ID', message: 'Razorpay Key ID is not configured' });
    } else if (keyId === 'your_razorpay_key_id_here') {
      errors.push({ field: 'VITE_RAZORPAY_KEY_ID', message: 'Please update your actual Razorpay Key ID' });
    }
    
    return errors;
  }, []);

  // Clear notification
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Show notification
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  }, []);

  // Validate form and environment
  const validateForm = useCallback((): boolean => {
    const errors = validateEnvironmentVariables();
    setValidationErrors(errors);
    return errors.length === 0;
  }, [validateEnvironmentVariables]);

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic License',
      prices: {
        INR: 999,
        USD: 12,
        EUR: 11,
        GBP: 10,
      },
      description: 'Perfect for personal projects and small content creation',
      features: [
        'Use in personal videos/content',
        'Social media posting rights',
        'Non-commercial use only',
        'Standard quality audio files',
        'Basic customer support',
        'Instant download',
      ],
      limitations: [
        'No commercial use',
        'No resale rights',
        'Attribution required',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro License',
      prices: {
        INR: 2999,
        USD: 36,
        EUR: 33,
        GBP: 30,
      },
      description: 'Ideal for commercial projects and professional content',
      features: [
        'Commercial use rights',
        'Broadcast & streaming rights',
        'YouTube monetization',
        'High-quality WAV files',
        'Priority customer support',
        'Instant download',
        'Extended usage rights',
        'No attribution required',
      ],
      limitations: [
        'Single project use',
        'No resale rights',
      ],
      popular: true,
    },
    {
      id: 'commercial',
      name: 'Commercial License',
      prices: {
        INR: 'Custom',
        USD: 'Custom',
        EUR: 'Custom',
        GBP: 'Custom',
      },
      description: 'Custom licensing for large-scale commercial projects',
      features: [
        'Unlimited commercial use',
        'Broadcast & TV rights',
        'Sync licensing available',
        'Master recordings included',
        'Custom arrangements',
        'Exclusive use options',
        'Full stems/multitracks',
        'Dedicated account manager',
      ],
      limitations: [],
      popular: false,
    },
  ];

  const handlePurchase = async (plan: Plan) => {
    setSelectedPlan(plan.id);
    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Check if user is logged in
      if (!currentUser) {
        showNotification('error', 'Please log in to purchase a license.');
        setIsLoading(false);
        return;
      }

      // Validate environment variables
      if (!validateForm()) {
        showNotification('error', 'Configuration error. Please check your environment variables.');
        setIsLoading(false);
        return;
      }

      // Check if Razorpay is loaded
      if (!isRazorpayLoaded) {
        showNotification('error', 'Payment system is not ready. Please wait a moment and try again.');
        setIsLoading(false);
        return;
      }

      if (razorpayError) {
        showNotification('error', razorpayError);
        setIsLoading(false);
        return;
      }

      // Show loading notification
      showNotification('info', 'Creating payment order...');

      // Get auth token
      const authToken = await getAuthToken();
      if (!authToken) {
        showNotification('error', 'Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Create order on backend
      const amountRaw = getPrice(plan.prices, currency);
      if (amountRaw === 'Custom' || typeof amountRaw !== 'number') {
        showNotification('error', 'Please select a fixed-price plan for online payment.');
        setIsLoading(false);
        return;
      }
      
      const amount = amountRaw as number;

      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const orderResponse = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          receipt: `receipt_${plan.id}_${Date.now()}`
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create order');
      }

      const order = await orderResponse.json();
      
      if (!order.success || !order.order_id) {
        throw new Error('Invalid order response from server');
      }

      showNotification('info', 'Opening secure payment gateway...');

      const options: RazorpayOptions = {
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'YoBaeXo Music',
        description: `License for ${plan.name}`,
        order_id: order.order_id,
        handler: async (response: PaymentResponse) => {
          try {
            showNotification('info', 'Verifying payment...');
            
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: amount,
                currency: currency
              }),
            });

            if (verifyResponse.ok) {
              showNotification('success', `Payment successful! Your ${plan.name} has been activated. Transaction ID: ${response.razorpay_payment_id}`);
            } else {
              const errorData = await verifyResponse.json().catch(() => ({}));
              throw new Error(errorData.error || errorData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showNotification('error', `Payment verification failed. Please contact support with Transaction ID: ${response.razorpay_payment_id}`);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            showNotification('info', 'Payment was cancelled. You can try again when ready.');
          },
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          contact: '',
        },
        notes: {
          address: 'YoBaeXo Music Platform',
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', (response: { error: { description?: string } }) => {
        setIsLoading(false);
        const error = response.error;
        const errorMessage = error.description || 'Payment failed. Please try again.';
        showNotification('error', errorMessage);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setIsLoading(false);
      showNotification('error', `Failed to initialize payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      {/* Notification System */}
      {notification && (
        <PaymentNotification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Music Licensing - {countryInfo?.name || 'India'}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Choose the perfect license for your project. From personal use to commercial broadcasting, we have the right solution for your needs.
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <h3 className="text-red-200 font-semibold mb-2">Configuration Errors:</h3>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Razorpay Load Error */}
        {razorpayError && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-200 font-semibold">Payment System Error:</span>
            </div>
            <p className="text-red-300 mt-1">{razorpayError}</p>
          </div>
        )}

        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">
            Currency automatically set to {currency} based on your location ({countryInfo?.name || 'India'})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-gray-800 rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 ${
                plan.popular
                  ? 'border-2 border-pink-400 shadow-2xl shadow-pink-400/20'
                  : 'border border-gray-700 hover:border-cyan-400/50'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 font-poppins">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {getPrice(plan.prices, currency) === 'Custom' ? 'Custom' :
                    typeof getPrice(plan.prices, currency) === 'number'
                      ? formatCurrency(getPrice(plan.prices, currency) as number, currency)
                      : 'Custom'
                  }
                  {getPrice(plan.prices, currency) !== 'Custom' && <span className="text-lg text-gray-400">/license</span>}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-start gap-3">
                        <div className="h-2 w-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-400 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => getPrice(plan.prices, currency) === 'Custom' ? document.getElementById('custom-form')?.scrollIntoView({ behavior: 'smooth' }) : handlePurchase(plan)}
                disabled={isLoading && selectedPlan === plan.id}
                className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white'
                    : getPrice(plan.prices, currency) === 'Custom'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-cyan-400'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                } ${isLoading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {getPrice(plan.prices, currency) === 'Custom' ? (
                      <>
                        <Mail className="h-5 w-5" />
                        Get Custom Quote
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Purchase License
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4 font-poppins">
            Need Help?
          </h3>
          <p className="text-gray-400 mb-6">
            Not sure which license is right for you? We're here to help!
          </p>
          <a
            href="mailto:info@yobaexo.com"
            className="inline-flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <Mail className="mr-2 h-5 w-5" />
            Contact Licensing Team
          </a>
        </div>
      </div>
    </div>
  );
};

export default Licensing;