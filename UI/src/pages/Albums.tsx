import React, { useState, useEffect } from "react";
import {
  Play,
  ExternalLink,
  Loader,
  Music,
  Search,
  Eye,
  Clock,
  // Instagram,
} from "lucide-react";
import VideoModal from "../components/VideoModal";
import PlaylistModal from "../components/PlaylistModal";
// import InstagramReelModal from "../components/InstagramReelModal";
import {
  youtubeAPI,
  YouTubePlaylist,
  YouTubeVideo,
} from "../lib/api";
// import { instagramService, InstagramReel } from "../services/instagram";

const Albums: React.FC = () => {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<{
    [key: string]: YouTubeVideo[];
  }>({});
  // const [reels, setReels] = useState<InstagramReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reelsError, setReelsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] =
    useState<YouTubeVideo | null>(null);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<YouTubePlaylist | null>(null);
  // const [reelModalOpen, setReelModalOpen] = useState(false);
  // const [selectedReel, setSelectedReel] = useState<InstagramReel | null>(null);

  useEffect(() => {
    loadPlaylists();
    loadReels();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await youtubeAPI.getPlaylists(10);
      if (response.success) {
        setPlaylists(response.playlists);

        // Load videos for each playlist (limit to 5 per playlist)
        const videosMap: { [key: string]: YouTubeVideo[] } = {};
        for (const playlist of response.playlists) {
          const videosResponse = await youtubeAPI.getPlaylistVideos(playlist.id, 5);
          if (videosResponse.success) {
            videosMap[playlist.id] = videosResponse.videos;
          }
        }
        setPlaylistVideos(videosMap);
      } else {
        throw new Error('Failed to load playlists');
      }
    } catch (err) {
      setError("Failed to load albums from YouTube. Please check your API configuration.");
      console.error("Error loading playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadReels = async () => {
    try {
      setReelsLoading(true);
      setReelsError(null);
      // const fetchedReels = await instagramService.getUserReels(12);
      // setReels(fetchedReels);
    } catch (err) {
      setReelsError(
        "Failed to load reels from Instagram. Please check your API configuration."
      );
      console.error("Error loading reels:", err);
    } finally {
      setReelsLoading(false);
    }
  };

  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredReels = reels.filter((reel) =>
  //   reel.caption.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const openVideo = (video: YouTubeVideo | null) => {
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

  // const openReel = (reel: InstagramReel) => {
  //   setSelectedReel(reel);
  //   setReelModalOpen(true);
  // };

  // const closeReelModal = () => {
  //   setReelModalOpen(false);
  //   setSelectedReel(null);
  // };

  const isLoading = loading || reelsLoading;
  const hasError = error || reelsError;

  if (isLoading) {
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

  if (hasError) {
    return (
      <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to Load Albums
          </h2>
          <p className="text-gray-400 mb-6">{error || reelsError}</p>
          <div className="space-y-3">
            {error && (
              <button
                onClick={loadPlaylists}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 mr-3"
              >
                Retry YouTube
              </button>
            )}
            {/* {reelsError && (
              <button
                onClick={loadReels}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Retry Instagram
              </button>
            )} */}
          </div>
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
              {/* and Instagram reels */}
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

          {/* Instagram Reels Section */}
          <div className="mb-12">
            {/* <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Instagram className="h-6 w-6 text-pink-500 mr-2" />
                Instagram <span className="text-pink-400 ml-1">Reels</span>
              </h2>
              {reels.length > 0 && (
                <a
                  href="https://www.instagram.com/yobaexo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 text-sm flex items-center"
                >
                  View on Instagram <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              )}
            </div> */}

            {/* {reelsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl h-32 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredReels.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-2xl">
                <Instagram className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Reels Available
                </h3>
                <p className="text-gray-400">
                  {reelsError || "Check back later for new Instagram reels"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredReels.map((reel, index) => (
                  <div
                    key={reel.id}
                    className="group bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                    onClick={() => openReel(reel)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative aspect-[9/16] overflow-hidden">
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.caption}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-xs font-semibold line-clamp-2">
                          {reel.caption}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                          <span>
                            ❤️ {reel.like_count}
                          </span>
                          <span>
                            💬{" "}
                            {reel.comments_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>

          {/* YouTube Albums Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Music className="h-6 w-6 text-red-500 mr-2" />
                YouTube <span className="text-red-400 ml-1">Albums</span>
              </h2>
              {playlists.length > 0 && (
                <a
                  href="https://www.youtube.com/@YoBaeXo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 text-sm flex items-center"
                >
                  View Channel <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              )}
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
                      onClick={() =>
                        openVideo(playlistVideos[playlist.id]?.[0])
                      }
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
                          View Playlist{" "}
                          <ExternalLink className="h-4 w-4 ml-1" />
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
                  Subscribe for the latest releases, behind-the-scenes content,
                  and exclusive music videos.
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
          videoId={selectedVideo?.id || ""}
          title={selectedVideo?.title || ""}
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
        {/* Instagram Reel Modal */}
        {/* {selectedReel && (
          <InstagramReelModal
            isOpen={reelModalOpen}
            reel={selectedReel}
            onClose={closeReelModal}
          />
        )} */}
      </div>
    </>
  );
};

export default Albums;
