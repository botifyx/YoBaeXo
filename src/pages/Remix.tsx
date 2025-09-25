import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Instagram, Youtube, Music2 } from 'lucide-react';
import { youtubeService, YouTubeVideo } from '../services/youtube';
import VideoModal from '../components/VideoModal';
const Remix: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await youtubeService.getChannelVideos(6);
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);
  const instagramReels = [
    {
      id: 1,
      title: 'Behind the Scenes: Studio Session',
      thumbnail: 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: '15K',
    },
    {
      id: 2,
      title: 'New Beat Preview',
      thumbnail: 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: '23K',
    },
    {
      id: 3,
      title: 'Equipment Tour',
      thumbnail: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: '19K',
    },
    {
      id: 4,
      title: 'Live Performance',
      thumbnail: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: '34K',
    },
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Remixes & <span className="text-pink-400">Content</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Explore remixes, extended versions, and behind-the-scenes content. 
            Get an exclusive look into the creative process and enjoy fresh takes on your favorite tracks.
          </p>
        </div>

        {/* YouTube Playlist Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white font-poppins">
              <span className="text-red-500">YouTube</span> Remixes
            </h2>
            <a
              href={`https://www.youtube.com/channel/${import.meta.env.VITE_YOUTUBE_CHANNEL_ID}/playlists`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Youtube className="mr-2 h-5 w-5" />
              View Playlist
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-white">
                Loading remixes...
              </div>
            ) : (
              videos.map((video: YouTubeVideo, index) => (
                <div
                  key={video.id}
                  className="group bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-colors duration-200 transform scale-75 group-hover:scale-100"
                      >
                        <Play className="h-6 w-6 ml-1" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                      {video.duration}
                    </div>
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {video.viewCount} views
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 font-poppins group-hover:text-pink-400 transition-colors duration-200 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm">YoBaeXo</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Audiomack Profile */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6">
              <Music2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              <span className="text-orange-400">Audiomack</span> Profile
            </h2>
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
              Follow me on Audiomack for exclusive remixes, unreleased tracks, and early access to new music. 
              Join thousands of fans discovering the latest electronic beats.
            </p>
            <a
              href="https://audiomack.com/yobaexo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Music2 className="mr-2 h-5 w-5" />
              Visit Audiomack Profile
              <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </div>
        </section>

        {/* Instagram Reels */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white font-poppins">
              <span className="text-pink-400">Instagram</span> Reels
            </h2>
            <a
              href="https://instagram.com/yobaexo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow on Instagram
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {instagramReels.map((reel, index) => (
              <div
                key={reel.id}
                className="group bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => window.open('https://instagram.com/yobaexo', '_blank')}
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition-colors duration-200">
                      <Instagram className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-pink-500 text-white px-2 py-1 rounded text-xs font-medium">
                    {reel.views} views
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white group-hover:text-pink-400 transition-colors duration-200 line-clamp-2">
                    {reel.title}
                  </h3>
                </div>
              </div>
            ))}
          <VideoModal
            isOpen={!!selectedVideo}
            videoId={selectedVideo?.id || ''}
            onClose={() => setSelectedVideo(null)}
            title={selectedVideo?.title || ''}
          />
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              Want to <span className="text-cyan-400">Remix</span> My Music?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Interested in creating your own remix of my tracks? Get in touch to discuss 
              remix opportunities and collaborations. Let's create something amazing together!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Get in Touch
              </a>
              <a
                href="/licensing"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-pink-400 text-pink-400 font-semibold rounded-full hover:bg-pink-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                View Licensing
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Remix;