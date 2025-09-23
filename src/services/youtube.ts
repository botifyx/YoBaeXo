export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  url: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  url: string;
}

export interface YouTubePlaylistItem extends YouTubeVideo {
  playlistTitle: string;
}

export interface YouTubeApiResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  }>;
}

export interface YouTubeVideoDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

class YouTubeService {
  private apiKey: string;
  private channelId: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    this.channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    if (!this.apiKey || !this.channelId) {
      throw new Error('YouTube API key or Channel ID not configured in environment variables');
    }
  }

  private parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      // First, get the videos from the channel
      const searchResponse = await fetch(
        `${this.baseUrl}/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet&order=date&maxResults=${maxResults}&type=video`
      );

      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData: YouTubeApiResponse = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        return [];
      }

      // Get video IDs for additional details
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // Get video details (duration, view count)
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?key=${this.apiKey}&id=${videoIds}&part=contentDetails,statistics`
      );

      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.status}`);
      }

      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      // Combine the data
      const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
          duration: this.parseDuration(details?.contentDetails.duration || 'PT0S'),
          viewCount: this.formatViewCount(details?.statistics.viewCount || '0'),
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      });

      return videos;
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return [];
    }
  }

  async searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      const searchResponse = await fetch(
        `${this.baseUrl}/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet&order=relevance&maxResults=${maxResults}&type=video&q=${encodeURIComponent(query)}`
      );

      if (!searchResponse.ok) {
        throw new Error(`YouTube API error: ${searchResponse.status}`);
      }

      const searchData: YouTubeApiResponse = await searchResponse.json();
      
      if (!searchData.items || searchData.items.length === 0) {
        return [];
      }

      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?key=${this.apiKey}&id=${videoIds}&part=contentDetails,statistics`
      );

      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.status}`);
      }

      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
          duration: this.parseDuration(details?.contentDetails.duration || 'PT0S'),
          viewCount: this.formatViewCount(details?.statistics.viewCount || '0'),
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        };
      });

      return videos;
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return [];
    }
  }

  async getChannelPlaylists(maxResults: number = 50): Promise<YouTubePlaylist[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/playlists?key=${this.apiKey}&channelId=${this.channelId}&part=snippet,contentDetails&maxResults=${maxResults}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      const playlists: YouTubePlaylist[] = data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
        videoCount: parseInt(item.contentDetails.itemCount) || 0,
        url: `https://www.youtube.com/playlist?list=${item.id}`,
      }));

      return playlists;
    } catch (error) {
      console.error('Error fetching YouTube playlists:', error);
      return [];
    }
  }

  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubePlaylistItem[]> {
    try {
      // Get playlist items
      let nextPageToken = '';
      let allItems: any[] = [];
      let fetched = 0;

      do {
        const itemsResponse = await fetch(
          `${this.baseUrl}/playlistItems?key=${this.apiKey}&playlistId=${playlistId}&part=snippet${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&maxResults=${Math.min(50, maxResults - fetched)}`
        );

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
        return [];
      }

      // Get video IDs for details
      const videoIds = allItems.map(item => item.snippet.resourceId.videoId).join(',');

      // Get video details
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?key=${this.apiKey}&id=${videoIds}&part=contentDetails,statistics`
      );

      if (!detailsResponse.ok) {
        throw new Error(`YouTube API error: ${detailsResponse.status}`);
      }

      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      // Get playlist info for title
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlists?key=${this.apiKey}&id=${playlistId}&part=snippet`
      );

      const playlistData = await playlistResponse.json();
      const playlistTitle = playlistData.items[0]?.snippet.title || '';

      // Combine data
      const videos: YouTubePlaylistItem[] = allItems.map((item, index) => {
        const details = detailsData.items[index];
        return {
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || '',
          publishedAt: item.snippet.publishedAt,
          duration: this.parseDuration(details?.contentDetails.duration || 'PT0S'),
          viewCount: this.formatViewCount(details?.statistics.viewCount || '0'),
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          playlistTitle: playlistTitle,
        };
      });

      return videos;
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      return [];
    }
  }
}

export const youtubeService = new YouTubeService();