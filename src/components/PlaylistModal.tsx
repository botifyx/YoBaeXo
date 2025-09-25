import React from 'react';
import { X, Music, Clock, Play } from 'lucide-react';
import VideoModal from './VideoModal';
import { YouTubePlaylistItem } from '../services/youtube';

interface PlaylistModalProps {
  isOpen: boolean;
  playlistTitle: string;
  videos: YouTubePlaylistItem[];
  onClose: () => void;
  onVideoSelect: (video: YouTubePlaylistItem) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ 
  isOpen, 
  playlistTitle, 
  videos, 
  onClose, 
}) => {
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState<YouTubePlaylistItem | null>(null);

  if (!isOpen) return null;

  const handleVideoClick = (video: YouTubePlaylistItem) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-pink-500 via-cyan-500 to-violet-500 p-4 flex justify-between items-center z-10">
            <div className="flex items-center">
              <Music className="h-5 w-5 text-white mr-2" />
              <h3 className="text-white font-semibold font-poppins">{playlistTitle}</h3>
              <span className="ml-2 text-white/80 text-sm">({videos.length} tracks)</span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Videos Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleVideoClick(video)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-pink-400 transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration}
                      </span>
                      <span>{video.viewCount} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {videos.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tracks available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Video Modal */}
      {videoModalOpen && selectedVideo && (
        <VideoModal
          isOpen={true}
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </>
  );
};

export default PlaylistModal;