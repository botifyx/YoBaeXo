import React, { useState } from 'react';
import { Check, Star, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Licensing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // const [customFormData, setCustomFormData] = useState({
  //   name: '',
  //   email: '',
  //   company: '',
  //   project: '',
  //   usage: '',
  //   budget: '',
  //   timeline: '',
  //   message: '',
  // });

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic License',
      price: '₹999',
      priceId: 'price_test_basic_replace',
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
      price: '₹2,999',
      priceId: 'price_test_pro_replace',
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
      price: 'Custom',
      priceId: 'price_test_commercial_replace',
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

  const handlePurchase = async (plan: any) => {
    
    setSelectedPlan(plan.id);
    navigate('/contact');

    try {
      // For now, just simulate the process
      // setTimeout(() => {
      //   alert(`Redirecting to payment for ${plan.name}...`);
      //   setIsLoading(false);
      //   setSelectedPlan(null);
      // }, 2000);
      
      // Actual Stripe integration would look like:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId: plan.priceId }),
      // });
      // const session = await response.json();
      // stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error('Payment error:', error);
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  // const handleCustomRequest = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     // Replace with actual webhook URL
  //     const response = await fetch('https://hooks.zapier.com/hooks/catch/0000000/AAAAAAA', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         type: 'licensing_request',
  //         ...customFormData,
  //         timestamp: new Date().toISOString(),
  //       }),
  //     });

  //     if (response.ok) {
  //       alert('Your custom licensing request has been submitted! We\'ll get back to you within 24 hours.');
  //       setCustomFormData({
  //         name: '',
  //         email: '',
  //         company: '',
  //         project: '',
  //         usage: '',
  //         budget: '',
  //         timeline: '',
  //         message: '',
  //       });
  //     } else {
  //       throw new Error('Failed to submit request');
  //     }
  //   } catch (error) {
  //     console.error('Form submission error:', error);
  //     alert('There was an error submitting your request. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Music <span className="text-pink-400">Licensing</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Choose the perfect license for your project. From personal use to commercial broadcasting, 
            we have the right solution for your needs.
          </p>
        </div>

        {/* Pricing Cards */}
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
                  {plan.price}
                  {plan.price !== 'Custom' && <span className="text-lg text-gray-400">/license</span>}
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
                onClick={() => plan.price === 'Custom' ? document.getElementById('custom-form')?.scrollIntoView({ behavior: 'smooth' }) : handlePurchase(plan)}
                disabled={isLoading && selectedPlan === plan.id}
                className={`w-full py-4 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white'
                    : plan.price === 'Custom'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-cyan-400'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                } ${isLoading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    {plan.price === 'Custom' ? (
                      <>
                        <Mail className="h-5 w-5" />
                        Get Custom Quote
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        Purchase License
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Custom Licensing Form */}
        {/* <div id="custom-form" className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-poppins">
              Custom <span className="text-cyan-400">Licensing Request</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Need something specific? Tell us about your project and we'll create a custom license package for you.
            </p>
          </div>

          <form onSubmit={handleCustomRequest} className="bg-gray-800 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customFormData.name}
                  onChange={(e) => setCustomFormData({ ...customFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customFormData.email}
                  onChange={(e) => setCustomFormData({ ...customFormData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                  Company/Organization
                </label>
                <input
                  type="text"
                  id="company"
                  value={customFormData.company}
                  onChange={(e) => setCustomFormData({ ...customFormData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type *
                </label>
                <select
                  id="project"
                  required
                  value={customFormData.project}
                  onChange={(e) => setCustomFormData({ ...customFormData, project: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors duration-200"
                >
                  <option value="">Select project type</option>
                  <option value="film">Film/Documentary</option>
                  <option value="tv">TV Show/Series</option>
                  <option value="commercial">Commercial/Advertisement</option>
                  <option value="game">Video Game</option>
                  <option value="podcast">Podcast</option>
                  <option value="app">Mobile App</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="usage" className="block text-sm font-medium text-gray-300 mb-2">
                  Intended Usage *
                </label>
                <select
                  id="usage"
                  required
                  value={customFormData.usage}
                  onChange={(e) => setCustomFormData({ ...customFormData, usage: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors duration-200"
                >
                  <option value="">Select usage type</option>
                  <option value="worldwide">Worldwide Distribution</option>
                  <option value="regional">Regional Distribution</option>
                  <option value="online">Online Only</option>
                  <option value="broadcast">TV/Radio Broadcast</option>
                  <option value="theatrical">Theatrical Release</option>
                  <option value="streaming">Streaming Platforms</option>
                </select>
              </div>
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Range
                </label>
                <select
                  id="budget"
                  value={customFormData.budget}
                  onChange={(e) => setCustomFormData({ ...customFormData, budget: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors duration-200"
                >
                  <option value="">Select budget range</option>
                  <option value="under-5k">Under ₹5,000</option>
                  <option value="5k-15k">₹5,000 - ₹15,000</option>
                  <option value="15k-50k">₹15,000 - ₹50,000</option>
                  <option value="50k-100k">₹50,000 - ₹1,00,000</option>
                  <option value="over-100k">Over ₹1,00,000</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
                Project Timeline
              </label>
              <input
                type="text"
                id="timeline"
                value={customFormData.timeline}
                onChange={(e) => setCustomFormData({ ...customFormData, timeline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                placeholder="e.g., Need by March 2024"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Additional Details *
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={customFormData.message}
                onChange={(e) => setCustomFormData({ ...customFormData, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                placeholder="Tell us more about your project, specific tracks you're interested in, and any special requirements..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Submit Request
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div> */}

        {/* FAQ or Additional Info */}
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