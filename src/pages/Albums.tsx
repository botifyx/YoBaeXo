import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Loader, Music, Search, Eye, Clock } from 'lucide-react';
import { youtubeService, YouTubePlaylist, YouTubePlaylistItem } from '../services/youtube';

const Albums: React.FC = () => {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<{ [key: string]: YouTubePlaylistItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPlaylists = await youtubeService.getChannelPlaylists(10);
      setPlaylists(fetchedPlaylists);

      // Load videos for each playlist (limit to 5 per playlist)
      const videosMap: { [key: string]: YouTubePlaylistItem[] } = {};
      for (const playlist of fetchedPlaylists) {
        const videos = await youtubeService.getPlaylistVideos(playlist.id, 5);
        videosMap[playlist.id] = videos;
      }
      setPlaylistVideos(videosMap);
    } catch (err) {
      setError('Failed to load albums from YouTube. Please check your API configuration.');
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openVideo = (video: YouTubePlaylistItem) => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-pink-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Albums</h2>
          <p className="text-gray-400">Fetching latest content from YouTube...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Albums</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadPlaylists}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Music <span className="text-pink-400">Albums</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore the complete collection from YoBaeXo's YouTube channel
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Albums Grid */}
        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Albums Found</h2>
            <p className="text-gray-400">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                {/* Album Cover */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/YoBaeXo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-80" />
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{playlist.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{playlist.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {playlist.videoCount} videos
                    </span>
                    <a
                      href={playlist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-pink-400 hover:text-pink-300"
                    >
                      View Playlist <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Video Previews */}
                {playlistVideos[playlist.id] && playlistVideos[playlist.id].length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="text-white font-semibold mb-3">Featured Tracks</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                      {playlistVideos[playlist.id].slice(0, 5).map((video) => (
                        <div
                          key={video.id}
                          className="flex-shrink-0 w-20 h-32 rounded-lg overflow-hidden bg-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => openVideo(video)}
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-20 object-cover"
                          />
                          <div className="p-1 text-xs text-white truncate">
                            {video.title}
                          </div>
                          <div className="flex items-center text-xs text-gray-400 space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* YouTube Channel Link */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              Visit My <span className="text-red-500">YouTube</span> Channel
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe for the latest releases, behind-the-scenes content, and exclusive music videos.
            </p>
            <a
              href="https://www.youtube.com/@YoBaeXo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              Subscribe on YouTube
              <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Albums;