import React from 'react';
import { X, Heart, MessageCircle, Eye, Play } from 'lucide-react';
import { InstagramReel } from '../services/instagram';

interface InstagramReelModalProps {
  isOpen: boolean;
  reel: InstagramReel;
  onClose: () => void;
}

const InstagramReelModal: React.FC<InstagramReelModalProps> = ({ 
  isOpen, 
  reel, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gray-900/90 hover:bg-gray-800 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 z-10"
          aria-label="Close reel"
        >
          <X size={24} />
        </button>

        {/* Reel Content */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
          {/* Video Player */}
          <div className="relative aspect-[9/16] bg-black">
            <video
              src={reel.media_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={reel.thumbnail_url}
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Play overlay for thumbnail */}
            {!reel.media_url.includes('.mp4') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-16 w-16 text-white opacity-80" />
              </div>
            )}
          </div>

          {/* Reel Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold font-poppins text-lg mb-2">
                  {reel.caption}
                </h3>
                <p className="text-gray-400 text-sm">
                  Posted on {new Date(reel.timestamp).toLocaleDateString()}
                </p>
              </div>
              
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 text-sm"
              >
                View on Instagram
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-gray-300">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-pink-400 mr-2" />
                <span className="font-semibold">{reel.like_count}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-400 mr-2" />
                <span className="font-semibold">{reel.comments_count}</span>
              </div>
              {reel.views && (
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-green-400 mr-2" />
                  <span className="font-semibold">{reel.views} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramReelModal;