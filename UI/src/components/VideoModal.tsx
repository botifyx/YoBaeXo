import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  videoId: string | null;
  onClose: () => void;
  title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, videoId, onClose, title = 'Video Preview' }) => {
  if (!isOpen || !videoId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-full mx-4 p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gray-900/90 hover:bg-gray-800 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 z-10"
          aria-label="Close video"
        >
          <X size={24} />
        </button>

        {/* Video Embed */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-96 md:h-[500px] rounded-2xl"
            frameBorder="0"
          />
          
          {/* Video Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white font-semibold font-poppins text-lg mb-1">{title}</h3>
            <p className="text-gray-300 text-sm">Preview from YoBaeXo - Open in YouTube for full experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;