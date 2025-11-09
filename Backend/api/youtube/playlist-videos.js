

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
    const playlistId = req.query.playlistId;
    const maxResults = parseInt(req.query.maxResults) || 50;

    if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
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

    // Get playlist items with pagination
    let nextPageToken = '';
    let allItems = [];
    let fetched = 0;

    do {
      const itemsUrl = `${baseUrl}/playlistItems?` + new URLSearchParams({
        key: apiKey,
        playlistId: playlistId,
        part: 'snippet',
        maxResults: Math.min(50, maxResults - fetched).toString(),
        ...(nextPageToken && { pageToken: nextPageToken })
      });

      const itemsResponse = await fetch(itemsUrl);
      
      if (!itemsResponse.ok) {
        throw new Error(`YouTube API error: ${itemsResponse.status}`);
      }

      const itemsData = await itemsResponse.json();
      
      if (!itemsData.items || itemsData.items.length === 0) {
        break;
      }

      allItems = allItems.concat(itemsData.items);
      fetched += itemsData.items.length;
      nextPageToken = itemsData.nextPageToken || '';
    } while (nextPageToken && fetched < maxResults);

    if (allItems.length === 0) {
      return res.status(200).json({
        success: true,
        videos: [],
        playlistTitle: '',
        message: 'No videos found in this playlist'
      });
    }

    // Get video IDs for details
    const videoIds = allItems.map(item => item.snippet.resourceId.videoId).join(',');

    // Get video details
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

    // Get playlist info for title
    const playlistUrl = `${baseUrl}/playlists?` + new URLSearchParams({
      key: apiKey,
      id: playlistId,
      part: 'snippet'
    });

    const playlistResponse = await fetch(playlistUrl);
    let playlistTitle = '';
    
    if (playlistResponse.ok) {
      const playlistData = await playlistResponse.json();
      playlistTitle = playlistData.items[0]?.snippet.title || '';
    }

    // Combine data
    const videos = allItems.map((item, index) => {
      const details = detailsData.items[index];
      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
        publishedAt: item.snippet.publishedAt,
        duration: parseDuration(details?.contentDetails?.duration || 'PT0S'),
        viewCount: formatViewCount(details?.statistics?.viewCount || '0'),
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        playlistTitle: playlistTitle
      };
    });

    res.status(200).json({
      success: true,
      videos: videos,
      playlistTitle: playlistTitle,
      totalResults: videos.length
    });

  } catch (error) {
    console.error('YouTube playlist videos error:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch playlist videos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching playlist videos'
    });
  }
};