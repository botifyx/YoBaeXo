import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Music, Download, Heart } from 'lucide-react';
import { youtubeService, YouTubePlaylist, YouTubeVideo } from '../services/youtube';

const Home: React.FC = () => {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [latestVideo, setLatestVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playlistData, videoData] = await Promise.all([
          youtubeService.getChannelPlaylists(6),
          youtubeService.getChannelVideos(1)
        ]);
        setPlaylists(playlistData);
        if (videoData.length > 0) {
          setLatestVideo(videoData[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 animate-fadeIn">
            <img
              src="/YoBaeXo.png"
              alt="YoBaeXo"
              className="h-32 w-auto mx-auto mb-8 drop-shadow-2xl"
              loading="lazy"
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-poppins animate-slideUp">
            <span className="bg-gradient-to-r from-pink-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              YoBaeXo
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-poppins animate-slideUp delay-300">
            Feel the Beat, Live the Vibe
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp delay-500">
            <Link
              to="/albums"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <Play className="mr-2 h-5 w-5" />
              Explore Albums
            </Link>
            <Link
              to="/licensing"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-semibold rounded-full hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
            >
              <Download className="mr-2 h-5 w-5" />
              License Music
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Albums Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-poppins">
              Featured <span className="text-pink-400">Albums</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover the latest beats and vibes from YoBaeXo's musical journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12 text-white">
                Loading albums...
              </div>
            ) : (
              playlists.map((playlist, index) => (
                <div
                  key={playlist.id}
                  className="group relative bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Playlist</span>
                      <span className="text-sm text-gray-400">2024</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-poppins">
                      {playlist.title}
                    </h3>
                    <div className="flex items-center justify-between text-gray-400 text-sm">
                      <span>Electronic</span>
                      <span className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {playlist.videoCount} tracks
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <a href={playlist.url} target="_blank" rel="noopener noreferrer" className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full transition-colors duration-200">
                      <Play className="h-6 w-6 ml-1" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/albums"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
            >
              View All Albums
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
                About <span className="text-cyan-400">YoBaeXo</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                YoBaeXo is an electronic music producer who creates immersive soundscapes that blend 
                cutting-edge beats with emotional depth. From ambient chill to high-energy techno, 
                every track is crafted to make you feel alive and connected to the music.
              </p>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                With influences ranging from synthwave to modern electronic, YoBaeXo's music 
                transcends genres to create unique experiences that resonate with listeners worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Contact Us
                </Link>
                <Link
                  to="/donate"
                  className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-pink-400 text-pink-400 font-semibold rounded-full hover:bg-pink-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Support Artist
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                {loading ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <div className="text-white">Loading video...</div>
                  </div>
                ) : latestVideo ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${latestVideo.id}`}
                    title={latestVideo.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <div className="text-white">No video available</div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur-xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;