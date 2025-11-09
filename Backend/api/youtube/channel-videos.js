
module.exports = async (req, res) => {
  // Disable caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('ETag', ''); // Clear ETag to prevent 304 responses

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const maxResults = parseInt(req.query.maxResults) || 50;

    if (!channelId) {
      return res.status(500).json({ error: 'YouTube channel ID not configured' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const baseUrl = 'https://www.googleapis.com/youtube/v3';
    
    // Helper functions
    const parseDuration = (duration) => {
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (!match) return '0:00';

      const hours = parseInt(match[1]?.replace('H', '') || '0');
      const minutes = parseInt(match[2]?.replace('M', '') || '0');
      const seconds = parseInt(match[3]?.replace('S', '') || '0');

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatViewCount = (count) => {
      const num = parseInt(count);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toString();
    };

    // Get channel videos
    const searchUrl = `${baseUrl}/search?` + new URLSearchParams({
      key: apiKey,
      channelId: channelId,
      part: 'snippet',
      order: 'date',
      maxResults: maxResults.toString(),
      type: 'video'
    });

    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return res.status(200).json({
        success: true,
        videos: [],
        message: 'No videos found for this channel'
      });
    }

    // Get video IDs for additional details
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');

    // Get video details (duration, view count)
    const detailsUrl = `${baseUrl}/videos?` + new URLSearchParams({
      key: apiKey,
      id: videoIds,
      part: 'contentDetails,statistics'
    });

    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    // Combine the data
    const videos = searchData.items.map((item, index) => {
      const details = detailsData.items[index];
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
        duration: parseDuration(details?.contentDetails?.duration || 'PT0S'),
        viewCount: formatViewCount(details?.statistics?.viewCount || '0'),
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        channelTitle: item.snippet.channelTitle
      };
    });

    res.status(200).json({
      success: true,
      videos: videos,
      totalResults: videos.length
    });

  } catch (error) {
    console.error('YouTube channel videos error:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch channel videos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching channel videos'
    });
  }
};