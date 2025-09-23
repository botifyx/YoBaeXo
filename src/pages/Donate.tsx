import React, { useState } from 'react';
import { Heart, Coffee, Music, Star, DollarSign } from 'lucide-react';

const Donate: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false,
  });

  const tipOptions = [
    { amount: 99, icon: Coffee, label: 'Coffee', description: 'Buy me a coffee' },
    { amount: 299, icon: Music, label: 'Beat', description: 'Support a new beat' },
    { amount: 499, icon: Star, label: 'Track', description: 'Help create a track' },
    { amount: 999, icon: Heart, label: 'Album', description: 'Fund an album' },
  ];

  const handleDonation = async (amount: number) => {
    setIsLoading(true);
    
    try {
      // Replace with actual Stripe integration
      const stripe = (window as any).Stripe('pk_test_replace_with_live_key');
      
      // For now, just simulate the process
      setTimeout(() => {
        alert(`Redirecting to payment for ₹${amount}...`);
        setIsLoading(false);
      }, 2000);
      
      // Actual Stripe integration would look like:
      // const response = await fetch('/api/create-donation-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     amount: amount * 100, // Convert to cents
      //     donor: donorForm,
      //   }),
      // });
      // const session = await response.json();
      // stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error('Donation error:', error);
      setIsLoading(false);
    }
  };

  const handleCustomDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    
    if (amount < 10) {
      alert('Minimum donation amount is ₹10');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Submit donor information via webhook
      await fetch('https://hooks.zapier.com/hooks/catch/0000000/AAAAAAA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation_intent',
          amount,
          ...donorForm,
          timestamp: new Date().toISOString(),
        }),
      });

      // Proceed with Stripe payment
      await handleDonation(amount);
    } catch (error) {
      console.error('Custom donation error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
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
        </div>

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
                  disabled={isLoading}
                  className={`group p-6 bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAmount === option.amount ? 'border-pink-400 bg-pink-400/10' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-4 group-hover:from-pink-500 group-hover:to-violet-500 transition-all duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 font-poppins">
                      ₹{option.amount}
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
                Donation Amount (₹) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  id="custom-amount"
                  required
                  min="10"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="Enter amount (minimum ₹10)"
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
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Heart className="h-5 w-5" />
                  Donate {customAmount && `₹${customAmount}`}
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