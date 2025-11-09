
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
    
    // Get channel playlists
    const playlistUrl = `${baseUrl}/playlists?` + new URLSearchParams({
      key: apiKey,
      channelId: channelId,
      part: 'snippet,contentDetails',
      maxResults: maxResults.toString()
    });

    const playlistResponse = await fetch(playlistUrl);
    
    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`);
    }

    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return res.status(200).json({
        success: true,
        playlists: [],
        message: 'No playlists found'
      });
    }

    // Format playlists
    const playlists = playlistData.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description || '',
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
      videoCount: parseInt(item.contentDetails.itemCount) || 0,
      url: `https://www.youtube.com/playlist?list=${item.id}`,
      publishedAt: item.snippet.publishedAt
    }));

    res.status(200).json({
      success: true,
      playlists: playlists,
      totalResults: playlists.length
    });

  } catch (error) {
    console.error('YouTube playlist error:', error);
    
    res.status(500).json({ 
      error: 'Failed to fetch YouTube playlists',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching playlists'
    });
  }
};