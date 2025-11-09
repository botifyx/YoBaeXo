import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, LogOut, CreditCard, Star } from 'lucide-react';
import { useAuth } from '../lib/auth';

const Profile: React.FC = () => {
  const { currentUser, userData, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !currentUser) {
      navigate('/login', { 
        state: { from: { pathname: '/profile' } },
        replace: true 
      });
    }
  }, [currentUser, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-poppins">
            My <span className="text-pink-400">Profile</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your account and view your licensing status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white font-poppins">
                    {userData?.name || currentUser.displayName || 'User'}
                  </h2>
                  <p className="text-gray-400">{userData?.email || currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>Email: {userData?.email || currentUser.email}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>Member since: {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-300">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span>
                    License Status: 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      userData?.licenseStatus === 'active' 
                        ? 'bg-green-900/50 text-green-200 border border-green-500/50' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {userData?.licenseStatus === 'active' ? 'Active' : 'Free'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* License Status Card */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">License Status</h3>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                userData?.licenseStatus === 'active' 
                  ? 'bg-green-900/30 border-green-500/50' 
                  : 'bg-gray-700/50 border-gray-600'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    userData?.licenseStatus === 'active' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {userData?.licenseStatus === 'active' ? 'Active License' : 'Free Account'}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {userData?.licenseStatus === 'active' 
                      ? 'You have full access to all licensed content'
                      : 'Upgrade to access premium content and features'
                    }
                  </p>
                  {userData?.licenseStatus !== 'active' && (
                    <button
                      onClick={() => navigate('/licensing')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg hover:from-pink-600 hover:to-violet-600 transition-all duration-200"
                    >
                      Get License
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/payment-history')}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Payment History</span>
                </button>
                <button
                  onClick={() => navigate('/licensing')}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Star className="h-5 w-5" />
                  <span>Music Licensing</span>
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;