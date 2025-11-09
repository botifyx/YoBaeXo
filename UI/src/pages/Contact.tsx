import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, Send, Music, Calendar } from 'lucide-react';
import { emailAPI } from '../lib/api';
import NotificationPopup from '../components/NotificationPopup';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [popupMessage, setPopupMessage] = useState('');

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: 'info@yobaexo.com',
      description: 'For general inquiries and collaborations',
    },
    // {
    //   icon: Music,
    //   title: 'Business',
    //   details: 'business@yobaexo.com',
    //   description: 'Licensing, bookings, and partnerships',
    // },
    // {
    //   icon: Headphones,
    //   title: 'Press',
    //   details: 'press@yobaexo.com',
    //   description: 'Media inquiries and interviews',
    // },
    {
      icon: Clock,
      title: 'Response Time',
      details: '24-48 hours',
      description: 'We respond to all messages promptly',
    },
  ];

  const categories = [
    'General Inquiry',
    'Collaboration',
    'Licensing',
    'Booking/Events',
    'Press/Media',
    'Technical Support',
    'Remix Request',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await emailAPI.sendEmail(formData);

      if (result.success) {
        setShowPopup(true);
        setPopupType('success');
        setPopupMessage('Thank you for your message! We\'ll get back to you within 24-48 hours.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
        });
      } else {
        setShowPopup(true);
        setPopupType('error');
        setPopupMessage(result.message || 'Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setShowPopup(true);
      setPopupType('error');
      setPopupMessage('There was an error sending your message. Please try again or email us directly at info@yobaexo.com.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Get In <span className="text-pink-400">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Have a question, want to collaborate, or just want to say hello? 
            We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 font-poppins">
              Let's <span className="text-cyan-400">Connect</span>
            </h2>
            
            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={info.title}
                    className="flex items-start gap-4 p-6 bg-gray-800 rounded-2xl hover:bg-gray-750 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1 font-poppins">
                        {info.title}
                      </h3>
                      <p className="text-cyan-400 font-medium mb-2">{info.details}</p>
                      <p className="text-gray-400 text-sm">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 font-poppins">
                Quick <span className="text-violet-400">Actions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/licensing"
                  className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200"
                >
                  <Music className="h-5 w-5 text-pink-400" />
                  <span className="text-white font-medium">License Music</span>
                </Link>
                {/* <a
                  href="/epk"
                  className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200"
                >
                  <Headphones className="h-5 w-5 text-cyan-400" />
                  <span className="text-white font-medium">Press Kit</span>
                </a> */}
                <Link
                  to="/albums"
                  className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200"
                >
                  <Calendar className="h-5 w-5 text-violet-400" />
                  <span className="text-white font-medium">View Albums</span>
                </Link>
                <Link
                  to="/donate"
                  className="flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors duration-200"
                >
                  <MapPin className="h-5 w-5 text-pink-400" />
                  <span className="text-white font-medium">Support Artist</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 font-poppins">
                Send a <span className="text-pink-400">Message</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-pink-400 transition-colors duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors duration-200 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center font-poppins">
            Frequently Asked <span className="text-cyan-400">Questions</span>
          </h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 font-poppins">
                How quickly do you respond?
              </h3>
              <p className="text-gray-400">
                We typically respond to all messages within 24-48 hours. For urgent matters, 
                please mark your email as high priority.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 font-poppins">
                Do you accept collaboration requests?
              </h3>
              <p className="text-gray-400">
                Yes! We're always open to collaborating with other artists. Please include 
                links to your work and details about your proposed collaboration.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 font-poppins">
                How do I license your music?
              </h3>
              <p className="text-gray-400">
                Check out our <Link to="/licensing" className="text-pink-400 hover:underline">licensing page</Link> for
                detailed information about our music licensing options and pricing.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 font-poppins">
                Are you available for live performances?
              </h3>
              <p className="text-gray-400">
                Yes, we're available for live performances and DJ sets. Please contact us 
                with details about your event, date, and location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NotificationPopup
      isOpen={showPopup}
      type={popupType}
      message={popupMessage}
      onClose={() => setShowPopup(false)}
    />
  </>
);
};

export default Contact;