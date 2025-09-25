import React, { useState, useEffect } from "react";
import {
  Play,
  ExternalLink,
  Loader,
  Music,
  Search,
  Eye,
  Clock
} from "lucide-react";
import VideoModal from "../components/VideoModal";
import PlaylistModal from "../components/PlaylistModal";
import {
  youtubeService,
  YouTubePlaylist,
  YouTubePlaylistItem,
} from "../services/youtube";

const Albums: React.FC = () => {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<{
    [key: string]: YouTubePlaylistItem[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubePlaylistItem | null>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<YouTubePlaylist | null>(null);

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
      setError(
        "Failed to load albums from YouTube. Please check your API configuration."
      );
      console.error("Error loading playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openVideo = (video: YouTubePlaylistItem | null) => {
    if (video) {
      setSelectedVideo(video);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  const openPlaylist = (playlist: YouTubePlaylist) => {
    setSelectedPlaylist(playlist);
    setPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setPlaylistModalOpen(false);
    setSelectedPlaylist(null);
  };

  if (loading) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
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

          <div className="text-center">
            <Loader className="h-12 w-12 text-pink-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Loading Albums
            </h2>
            <p className="text-gray-400">
              Fetching latest content from YouTube...
            </p>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
                Visit My <span className="text-red-500">YouTube</span> Channel
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Subscribe for the latest releases, behind-the-scenes content,
                and exclusive music videos.
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
  }

  if (error) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to Load Albums
          </h2>
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
    <>
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12 animate-slideUp">
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
            <h2 className="text-xl font-semibold text-white mb-2">
              No Albums Found
            </h2>
            <p className="text-gray-400">
              Try adjusting your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaylists.map((playlist, index) => (
              <div
                key={playlist.id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl card-hover neon-pink animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Album Cover */}
                <div
                  className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center group cursor-pointer"
                  onClick={() => openVideo(playlistVideos[playlist.id]?.[0])}
                >
                  <img
                    src={playlist.thumbnail}
                    alt={playlist.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/YoBaeXo.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-12 w-12 text-white opacity-90 hover:scale-110 transition-transform" />
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {playlist.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {playlist.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {playlist.videoCount} videos
                    </span>
                    <button
                      onClick={() => openPlaylist(playlist)}
                      className="flex items-center text-pink-400 hover:text-pink-300 cursor-pointer transition-colors"
                    >
                      View Playlist <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Video Previews */}
                {playlistVideos[playlist.id] &&
                  playlistVideos[playlist.id].length > 0 && (
                    <div className="px-6 pb-6">
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Music className="h-5 w-5 mr-2 text-pink-400" />
                        Featured Tracks
                      </h4>
                      <div className="flex space-x-3 overflow-x-auto pb-2">
                        {playlistVideos[playlist.id]
                          .slice(0, 5)
                          .map((video) => (
                            <div
                              key={video.id}
                              className="flex-shrink-0 w-20 h-32 rounded-lg overflow-hidden bg-gray-700 cursor-pointer hover:scale-105 transition-all duration-200 relative group"
                              onClick={() => openVideo(video)}
                            >
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-20 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                              <div className="p-1 text-xs text-white truncate line-clamp-2">
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
          <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-2xl p-12 glass">
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              Visit My <span className="text-red-500">YouTube</span> Channel
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Subscribe for the latest releases, behind-the-scenes content, and
              exclusive music videos.
            </p>
            <a
              href="https://www.youtube.com/@YoBaeXo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg btn-glow"
            >
              <Play className="mr-2 h-5 w-5" />
              Subscribe on YouTube
              <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>

    {/* Video Modal */}
    <VideoModal
      isOpen={modalOpen}
      videoId={selectedVideo?.id || ''}
      title={selectedVideo?.title || ''}
      onClose={closeModal}
    />

    {/* Playlist Modal */}
    {selectedPlaylist && (
      <PlaylistModal
        isOpen={playlistModalOpen}
        playlistTitle={selectedPlaylist.title}
        videos={playlistVideos[selectedPlaylist.id] || []}
        onClose={closePlaylistModal}
        onVideoSelect={openVideo}
      />
    )}
    </>
  );
};

export default Albums;
