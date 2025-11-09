import { auth } from './firebase';

// YouTube API interfaces
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  url: string;
  channelTitle?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  url: string;
  publishedAt?: string;
}

export interface YouTubePlaylistItem extends YouTubeVideo {
  playlistTitle: string;
}

// Base API configuration for Vercel production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

// API client class for making authenticated requests
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Get authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Make authenticated request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    // Only include auth token if required and available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    if (requireAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const fullUrl = `${this.baseURL}${endpoint}`;
    console.log('Making request to:', fullUrl);
    console.log('Request config:', config);

    const response = await fetch(fullUrl, config);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      console.error('Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string | number>, requireAuth: boolean = false): Promise<T> {
    let url = endpoint;
    
    // Add parameters and cache-busting
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      // Add cache-busting timestamp to parameters
      searchParams.append('_t', Date.now().toString());
      url += `?${searchParams.toString()}`;
    } else {
      // If no parameters, add cache-busting as the first parameter
      url += `?_t=${Date.now()}`;
    }
    
    console.log('API GET request:', url);
    
    return this.request<T>(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    }, requireAuth);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Specific API methods
export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post<{ message: string; user: any; customToken?: string }>('/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    apiClient.post<{ message: string; user: any; customToken?: string }>('/register', { name, email, password }),
};

export const paymentAPI = {
  createOrder: (amount: number, currency: string = 'INR', receipt?: string) =>
    apiClient.post<{ success: boolean; order_id: string; amount: number; currency: string; key_id: string }>(
      '/create-order',
      { amount, currency, receipt }
    ),
  
  verifyPayment: (orderId: string, paymentId: string, signature: string, amount: number, currency: string = 'INR') =>
    apiClient.post<{ success: boolean; message: string; paymentId: string; orderDetails: any }>(
      '/verify-payment',
      { order_id: orderId, payment_id: paymentId, signature, amount, currency }
    ),
  
  getPaymentHistory: (page: number = 1, limit: number = 10) =>
    apiClient.get<{ success: boolean; payments: any[]; pagination: any }>(
      '/payment-history',
      { page, limit }
    ),
};

export const emailAPI = {
  sendEmail: (formData: { name: string; email: string; subject: string; category: string; message: string }) =>
    apiClient.post<{ success: boolean; message: string; emailId?: string }>(
      '/send-email',
      formData
    ),
};

export const youtubeAPI = {
  searchVideos: (query: string, maxResults: number = 20) =>
    apiClient.get<{ success: boolean; videos: any[]; totalResults: number; query: string }>(
      '/youtube/search',
      { query, maxResults },
      false
    ),
  
  getPlaylists: (maxResults: number = 50) =>
    apiClient.get<{ success: boolean; playlists: any[]; totalResults: number }>(
      '/youtube/playlist',
      { maxResults },
      false
    ),
  
  getChannelVideos: (maxResults: number = 50) =>
    apiClient.get<{ success: boolean; videos: YouTubeVideo[]; totalResults: number }>(
      '/youtube/channel-videos',
      { maxResults },
      false
    ),
  
  getPlaylistVideos: (playlistId: string, maxResults: number = 50) =>
    apiClient.get<{ success: boolean; videos: any[]; playlistTitle: string; totalResults: number }>(
      '/youtube/playlist-videos',
      { playlistId, maxResults },
      false
    ),
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Utility function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;