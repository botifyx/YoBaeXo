import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Coffee, Music, Star, DollarSign, CreditCard, AlertCircle, CheckCircle, X } from 'lucide-react';
import { getUserLocation, formatCurrency, type CountryInfo } from '../lib/location';
import { useAuth } from '../lib/auth';

// Define types for better TypeScript support
type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

// Custom hook to dynamically load the Razorpay script
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

const Donate: React.FC = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { currentUser, getAuthToken } = useAuth();
  const { isLoaded: isRazorpayLoaded, error: razorpayError } = useRazorpay();

  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false,
  });

  // Currency conversion rates (approximate - in production, fetch from API)
  const conversionRates: Record<Currency, Record<Currency, number>> = {
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0096, INR: 1 },
    USD: { INR: 83, EUR: 0.92, GBP: 0.79, USD: 1 },
    EUR: { INR: 90, USD: 1.09, GBP: 0.86, EUR: 1 },
    GBP: { INR: 104, USD: 1.27, EUR: 1.16, GBP: 1 }
  };

  // Convert amount from INR to target currency and round appropriately
  const convertAmount = (inrAmount: number, targetCurrency: Currency): number => {
    if (targetCurrency === 'INR') return Math.round(inrAmount);
    
    const rate = conversionRates.INR[targetCurrency];
    const converted = inrAmount * rate;
    
    // Round based on currency
    return Math.round(converted * 100) / 100; // Round to 2 decimal places
  };

  const tipOptions = [
    { amount: 99, icon: Coffee, label: 'Coffee', description: 'Buy me a coffee' },
    { amount: 299, icon: Music, label: 'Beat', description: 'Support a new beat' },
    { amount: 499, icon: Star, label: 'Track', description: 'Help create a track' },
    { amount: 999, icon: Heart, label: 'Album', description: 'Fund an album' },
  ];

  // Detect user location and set currency on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const locationInfo = await getUserLocation();
        setCountryInfo(locationInfo);
        setCurrency(locationInfo.currency);
      } catch (error) {
        console.warn('Failed to detect user location:', error);
        setCountryInfo({ code: 'IN', name: 'India', currency: 'INR', symbol: '₹' });
        setCurrency('INR');
      }
    };
    
    detectLocation();
  }, []);

  // Helper function to safely get converted price
  const getConvertedPrice = useCallback((inrAmount: number, curr: Currency): number => {
    return convertAmount(inrAmount, curr);
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

  const handleDonation = async (inrAmount: number) => {
    setSelectedPlan(`donation_${inrAmount}`);
    setIsLoading(true);
    setValidationErrors([]);

    try {
      // Check if Razorpay is loaded
      if (!isRazorpayLoaded) {
        showNotification('error', 'Payment system is not ready. Please wait a moment and try again.');
        setIsLoading(false);
        setSelectedPlan(null);
        return;
      }

      if (razorpayError) {
        showNotification('error', razorpayError);
        setIsLoading(false);
        setSelectedPlan(null);
        return;
      }

      // Validate environment variables
      if (!validateForm()) {
        showNotification('error', 'Configuration error. Please check your environment variables.');
        setIsLoading(false);
        setSelectedPlan(null);
        return;
      }

      // Convert INR amount to selected currency
      const convertedAmount = getConvertedPrice(inrAmount, currency);
      
      showNotification('info', 'Creating payment order...');

      // Create order on backend
      const baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
      
      const orderResponse = await fetch(`${baseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser && { 'Authorization': `Bearer ${await getAuthToken()}` }),
        },
        body: JSON.stringify({
          amount: convertedAmount,
          currency: currency,
          receipt: `donation_${inrAmount}_${Date.now()}`
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
        description: `Donation - ${inrAmount === 99 ? 'Coffee' : inrAmount === 299 ? 'Beat' : inrAmount === 499 ? 'Track' : 'Album'}`,
        order_id: order.order_id,
        handler: async (response: PaymentResponse) => {
          try {
            showNotification('info', 'Verifying payment...');
            
            const verifyResponse = await fetch(`${baseUrl}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(currentUser && { 'Authorization': `Bearer ${await getAuthToken()}` }),
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: convertedAmount, // Send the amount that was charged
                currency: currency // Send the currency that was used
              }),
            });

            if (verifyResponse.ok) {
              showNotification('success', `Thank you for your donation! Transaction ID: ${response.razorpay_payment_id}`);
            } else {
              const errorData = await verifyResponse.json().catch(() => ({}));
              throw new Error(errorData.error || errorData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showNotification('error', `Payment verification failed. Please contact support with Transaction ID: ${response.razorpay_payment_id}`);
          } finally {
            setIsLoading(false);
            setSelectedPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setSelectedPlan(null);
            showNotification('info', 'Payment was cancelled. You can try again when ready.');
          },
        },
        prefill: {
          name: donorForm.name || currentUser?.displayName || '',
          email: donorForm.email || currentUser?.email || '',
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
        setSelectedPlan(null);
        const error = response.error;
        const errorMessage = error.description || 'Payment failed. Please try again.';
        showNotification('error', errorMessage);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setIsLoading(false);
      setSelectedPlan(null);
      showNotification('error', `Failed to initialize payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCustomDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    
    // Validate minimum amount in selected currency
    const minAmount = currency === 'INR' ? 10 : currency === 'USD' ? 0.5 : currency === 'EUR' ? 0.5 : 0.4;
    
    if (amount < minAmount) {
      showNotification('error', `Minimum donation amount is ${formatCurrency(minAmount, currency)}`);
      return;
    }
    
    setSelectedPlan('custom_donation');
    
    // Convert user amount to INR for backend processing
    const inrAmount = currency === 'INR' ? amount : Math.round(amount * (conversionRates[currency]?.INR || 83));
    
    await handleDonation(inrAmount);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-6">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Support <span className="text-pink-400">YoBaeXo</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your support helps keep the music flowing. Every contribution goes directly towards
            creating new beats, upgrading equipment, and bringing you the best electronic music experience.
          </p>
          <p className="text-cyan-400 text-sm mt-2">
            Currency automatically set to {currency} based on your location ({countryInfo?.name || 'India'})
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

        {/* Quick Tip Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center font-poppins">
            Quick <span className="text-cyan-400">Support</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tipOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.amount}
                  onClick={() => handleDonation(option.amount)}
                  disabled={isLoading && selectedPlan === `donation_${option.amount}`}
                  className={`group p-6 bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedPlan === `donation_${option.amount}` ? 'border-pink-400 bg-pink-400/10' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-4 group-hover:from-pink-500 group-hover:to-violet-500 transition-all duration-300">
                      {isLoading && selectedPlan === `donation_${option.amount}` ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Icon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 font-poppins">
                      {isLoading && selectedPlan === `donation_${option.amount}` ? (
                        <span className="text-gray-400">Processing...</span>
                      ) : (
                        formatCurrency(getConvertedPrice(option.amount, currency), currency)
                      )}
                    </h3>
                    <p className="text-cyan-400 font-medium mb-1">{option.label}</p>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Donation Form */}
        <div className="bg-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center font-poppins">
            Custom <span className="text-violet-400">Donation</span>
          </h2>
          
          <form onSubmit={handleCustomDonation}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="donor-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="donor-name"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="donor-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="donor-email"
                  value={donorForm.email}
                  onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-300 mb-2">
                Donation Amount ({currency}) *
              </label>
              <div className="relative">
                {/* <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" /> */}
                <input
                  type="number"
                  id="custom-amount"
                  required
                  min={currency === 'INR' ? 10 : currency === 'USD' ? 0.5 : currency === 'EUR' ? 0.5 : 0.4}
                  step={currency === 'INR' ? "1" : "0.01"}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder={`Enter amount (minimum ${formatCurrency(currency === 'INR' ? 10 : currency === 'USD' ? 0.5 : currency === 'EUR' ? 0.5 : 0.4, currency)})`}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="donor-message" className="block text-sm font-medium text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="donor-message"
                rows={4}
                value={donorForm.message}
                onChange={(e) => setDonorForm({ ...donorForm, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                placeholder="Leave a message for YoBaeXo (this will be shared unless you choose to remain anonymous)"
              ></textarea>
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={donorForm.anonymous}
                  onChange={(e) => setDonorForm({ ...donorForm, anonymous: e.target.checked })}
                  className="w-5 h-5 text-pink-400 bg-gray-700 border-gray-600 rounded focus:ring-pink-400 focus:ring-2"
                />
                <span className="text-gray-300">
                  Make this donation anonymous (your name and message won't be shared publicly)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !customAmount}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && selectedPlan === 'custom_donation' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Donate {customAmount && formatCurrency(parseFloat(customAmount), currency)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Why Support Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8 font-poppins">
            Why <span className="text-cyan-400">Support?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-4">
                <Music className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">New Music</h3>
              <p className="text-gray-400">
                Your support directly funds new track production and helps bring fresh beats to life.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Better Quality</h3>
              <p className="text-gray-400">
                Contributions help upgrade equipment and software for higher quality music production.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400">
                Join a community of music lovers supporting independent electronic music creation.
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-16 text-center bg-gradient-to-r from-gray-800 to-gray-750 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 font-poppins">
            Thank You! 🙏
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Every contribution, no matter the size, means the world to me. Your support keeps the creative 
            energy flowing and helps bring new electronic music experiences to life. Together, we're 
            building something special in the world of electronic music.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Donate;