const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

/**
 * Converts a stored cover path to a full displayable URL.
 * Handles: local /uploads/... paths, full http URLs, and undefined.
 */
export const getImageUrl = (src?: string | null): string => {
  if (!src) return '/images/placeholder-book.png';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) return src;
  // local upload path like /uploads/book-covers/uuid.jpg
  return `${BACKEND_ORIGIN}${src}`;
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
  errors?: string[];
}

export class ApiError extends Error {
  constructor(public message: string, public errors?: string[]) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
export const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
  
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
};

// Token refresh state – prevents parallel refresh races
let _isRefreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

async function _doRefresh(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const data = await res.json();
  const newAccess: string = data.accessToken;
  const newRefresh: string = data.refreshToken || refreshToken;
  tokenManager.setTokens(newAccess, newRefresh);
  return newAccess;
}

// API call wrapper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = tokenManager.getAccessToken();

  // Don't set Content-Type for FormData; let the browser add the multipart boundary automatically
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // network or CORS error
    console.error('Network error while calling API:', err);
    throw new ApiError(
      `Failed to reach API at ${API_BASE_URL}${endpoint}. ` +
        'Please check your API_URL environment variable and ensure the backend is running.',
      []
    );
  }

  // ── Auto-refresh on 401 ──────────────────────────────────────────────────
  if (response.status === 401 && endpoint !== '/auth/refresh-token' && endpoint !== '/auth/login') {
    try {
      let newToken: string;

      if (_isRefreshing) {
        // Another request is already refreshing — queue this one
        newToken = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Refresh queue timeout')), 15000);
          _refreshQueue.push((t) => { clearTimeout(timer); resolve(t); });
        });
      } else {
        _isRefreshing = true;
        try {
          newToken = await _doRefresh();
          _refreshQueue.forEach(cb => cb(newToken));
        } finally {
          _isRefreshing = false;
          _refreshQueue = [];
        }
      }

      // Retry original request with the new token
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      let retryResponse: Response;
      try {
        retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        });
      } catch (err) {
        throw new ApiError('Network error on retry after token refresh');
      }

      const retryData = await retryResponse.json();
      if (!retryResponse.ok) {
        if (retryData.errors && Array.isArray(retryData.errors)) {
          const msgs = retryData.errors.map((e: any) => e.message || e.msg || JSON.stringify(e));
          throw new ApiError(retryData.message || msgs[0] || 'Error', msgs);
        }
        throw new ApiError(retryData.message || 'An error occurred', retryData.errors);
      }
      return retryData;
    } catch {
      // Refresh failed — clear tokens and redirect to login
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError('Session expired. Please log in again.');
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  const data = await response.json();

  if (!response.ok) {
    // Handle validation errors (array format)
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map((err: any) => 
        err.message || err.msg || JSON.stringify(err)
      );
      throw new ApiError(
        data.message || errorMessages[0] || 'Validation error',
        errorMessages
      );
    }
    
    throw new ApiError(
      data.message || 'An error occurred',
      data.errors
    );
  }
  
  return data;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiCall<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Backend returns tokens at the top level: { success, accessToken, refreshToken, user }
    const token = response.accessToken ?? response.data?.accessToken;
    const refresh = response.refreshToken ?? response.data?.refreshToken;
    const user = response.user ?? response.data?.user;
    if (token) {
      tokenManager.setTokens(token, refresh ?? '');
      tokenManager.setUser(user);
    }

    return response;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiCall<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const token = response.accessToken ?? response.data?.accessToken;
    const refresh = response.refreshToken ?? response.data?.refreshToken;
    const user = response.user ?? response.data?.user;
    if (token) {
      tokenManager.setTokens(token, refresh ?? '');
      tokenManager.setUser(user);
    }

    return response;
  },
  
  logout: async (): Promise<void> => {
    const refreshToken = tokenManager.getRefreshToken();
    
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      tokenManager.clearTokens();
    }
  },
  
  getCurrentUser: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },
  
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new ApiError('No refresh token available');
    }
    
    const response = await apiCall<{ data: { accessToken: string } }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },  
  googleLogin: (redirectUrl?: string) => {
    const url = redirectUrl || window.location.href;
    window.location.href = `${API_BASE_URL}/auth/google?redirect=${encodeURIComponent(url)}`;
  }
};

// User API
export const userApi = {
  getProfile: async () => {
    return apiCall('/users/profile', {
      method: 'GET',
    });
  },
  
  updateProfile: async (data: any) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadProfilePicture: async (file: File) => {
    const accessToken = tokenManager.getAccessToken();
    const form = new FormData();
    form.append('image', file);
    const headers: Record<string, string> = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE_URL}/users/profile-picture`, {
      method: 'POST',
      headers,
      body: form,
    });

    const data = await res.json();
    if (!res.ok) throw new ApiError(data.message || 'Upload failed');
    return data;
  },
  
  getPreferences: async () => {
    return apiCall('/users/preferences', {
      method: 'GET',
    });
  },
  
  updatePreferences: async (preferences: any) => {
    return apiCall('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  followUser: async (id: string) =>
    apiCall(`/users/${id}/follow`, { method: 'POST' }),

  unfollowUser: async (id: string) =>
    apiCall(`/users/${id}/follow`, { method: 'DELETE' }),

  getUserReviews: async (id: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    const qs = q.toString();
    return apiCall(`/users/${id}/reviews${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  getUserReadingList: async (id: string) =>
    apiCall(`/users/${id}/reading`, { method: 'GET' }),

  getUserPublishedBooks: async (id: string) =>
    apiCall(`/users/${id}/books`, { method: 'GET' }),

  getUserStats: async (id: string) =>
    apiCall(`/users/${id}/stats`, { method: 'GET' }),
};

// Stats/Analytics API
export const statsApi = {
  // Get comprehensive reading insights for the current user
  getReadingInsights: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    return apiCall(`/stats/reading-insights${params}`, { method: 'GET' });
  },
  
  // Get reading activity (daily/weekly/monthly)
  getReadingActivity: async (period: 'week' | 'month' | 'year' = 'month', year?: number) => {
    const params = new URLSearchParams();
    params.append('period', period);
    if (year) params.append('year', year.toString());
    return apiCall(`/stats/reading-activity?${params}`, { method: 'GET' });
  },
  
  // Get genre breakdown
  getGenreBreakdown: async () => {
    return apiCall('/stats/genre-breakdown', { method: 'GET' });
  },
  
  // Get reading moods distribution
  getMoodsBreakdown: async () => {
    return apiCall('/stats/moods-breakdown', { method: 'GET' });
  },
  
  // Get reading challenge progress
  getChallengeProgress: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    return apiCall(`/stats/challenge-progress${params}`, { method: 'GET' });
  },
  
  // Get achievements
  getAchievements: async () => {
    return apiCall('/stats/achievements', { method: 'GET' });
  },
  
  // Get reading performance analysis
  getPerformanceAnalysis: async () => {
    return apiCall('/stats/performance', { method: 'GET' });
  },
  
  // Get weekly summary
  getWeeklySummary: async () => {
    return apiCall('/stats/weekly-summary', { method: 'GET' });
  },
};

// Books API
export const booksApi = {
  getAll: async (params?: { search?: string; genre?: string; mood?: string; page?: number; limit?: number; sortBy?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.genre) queryParams.append('genre', params.genre);
    if (params?.mood) queryParams.append('mood', params.mood);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const queryString = queryParams.toString();
    return apiCall(`/books${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Most clicked / viewed books of all time
  getPopular: async (limit = 8) => {
    return apiCall(`/books/popular?limit=${limit}`, { method: 'GET' });
  },

  // Books trending this week (highest weeklyViews)
  getTrendingWeekly: async (limit = 8) => {
    return apiCall(`/books/trending?limit=${limit}`, { method: 'GET' });
  },

  getById: async (id: string) => {
    return apiCall(`/books/${id}`, {
      method: 'GET',
    });
  },

  create: async (bookData: any) => {
    return apiCall('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  search: async (query: string, filters?: any) => {
    return apiCall('/books/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  },

  // User book submission (restricted fields, status → pending)
  submit: async (formData: FormData) =>
    apiCall('/books/submit', { method: 'POST', body: formData }),

  // User's own submitted books
  getMySubmissions: async () =>
    apiCall('/books/my-submissions', { method: 'GET' }),

  // Other books by same author, publisher, or editors
  getEditions: async (id: string, limit = 6) =>
    apiCall(`/books/${id}/editions?limit=${limit}`, { method: 'GET' }),
};

// Recommendations API
export const recommendationsApi = {
  getPersonalized: async (params?: { limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    
    return apiCall(`/recommendations${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },
  
  getTrending: async (params?: { limit?: number; days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.days) queryParams.append('days', params.days.toString());
    const queryString = queryParams.toString();
    
    return apiCall(`/recommendations/trending${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },
  
  getSimilar: async (bookId: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    const queryString = queryParams.toString();
    return apiCall(`/recommendations/similar/${bookId}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },
  
  getByMood: async (mood: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    const queryString = queryParams.toString();
    return apiCall(`/recommendations/mood/${mood}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getAIRecommendations: async () => {
    return apiCall('/recommendations/ai', {
      method: 'GET',
    });
  },
};

// Reading API
export const readingApi = {
  getAll: async (status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    const queryString = queryParams.toString();
    return apiCall(`/reading${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },
  
  getCurrentlyReading: async () => {
    return apiCall('/reading?status=currently_reading', {
      method: 'GET',
    });
  },
  
  getWantToRead: async () => {
    return apiCall('/reading?status=want_to_read', {
      method: 'GET',
    });
  },
  
  getFinished: async () => {
    return apiCall('/reading?status=finished', {
      method: 'GET',
    });
  },
  
  addToReading: async (bookId: string, status: string = 'currently_reading') => {
    return apiCall('/reading', {
      method: 'POST',
      body: JSON.stringify({ bookId, status }),
    });
  },
  
  updateProgress: async (readingId: string, pagesRead: number, timeSpent?: number) => {
    return apiCall(`/reading/${readingId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ pagesRead, timeSpent }),
    });
  },
  
  markAsFinished: async (readingId: string) => {
    return apiCall(`/reading/${readingId}/finish`, {
      method: 'PUT',
    });
  },
};

// Community API
export const communityApi = {
  getFeed: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    
    return apiCall(`/community/feed${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },
  
  getUserActivity: async (userId: string) => {
    return apiCall(`/community/activity/${userId}`, {
      method: 'GET',
    });
  },
};

// Book Clubs API (backend uses /api/clubs)
export const bookClubsApi = {
  getAll: async (params?: { type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.type)   q.append('type',   params.type);
    if (params?.search) q.append('search', params.search);
    return apiCall(`/clubs${q.toString() ? `?${q}` : ''}`, { method: 'GET' });
  },

  // Returns only the caller's own clubs (all statuses including pending)
  getMine: async () => apiCall('/clubs/mine', { method: 'GET' }),

  getById: async (id: string) => apiCall(`/clubs/${id}`, { method: 'GET' }),

  // Create — always lands as 'pending' server-side
  create: async (formData: FormData) =>
    apiCall('/clubs', { method: 'POST', body: formData }),

  join: async (clubId: string) =>
    apiCall(`/clubs/${clubId}/join`, { method: 'POST' }),

  leave: async (clubId: string) =>
    apiCall(`/clubs/${clubId}/members`, { method: 'DELETE' }),

  getDiscussions: async (clubId: string) =>
    apiCall(`/clubs/${clubId}/discussions`, { method: 'GET' }),

  createDiscussion: async (clubId: string, data: { book: string; title: string; content: string; chapterNumber?: number; chapterTitle?: string; containsSpoilers?: boolean }) =>
    apiCall(`/clubs/${clubId}/discussions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addReply: async (discussionId: string, content: string) =>
    apiCall(`/clubs/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Join requests (private clubs)
  getJoinRequests: async (clubId: string) =>
    apiCall(`/clubs/${clubId}/requests`, { method: 'GET' }),

  acceptJoinRequest: async (clubId: string, userId: string) =>
    apiCall(`/clubs/${clubId}/requests/${userId}/accept`, { method: 'POST' }),

  rejectJoinRequest: async (clubId: string, userId: string) =>
    apiCall(`/clubs/${clubId}/requests/${userId}`, { method: 'DELETE' }),

  updateProgress: async (clubId: string, pagesRead: number) =>
    apiCall(`/clubs/${clubId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ pagesRead }),
    }),
};

// Collections API
export const collectionsApi = {
  getAll: async () => {
    return apiCall('/collections', {
      method: 'GET',
    });
  },
  
  create: async (name: string, description?: string) => {
    return apiCall('/collections', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },
  
  addBook: async (collectionId: string, bookId: string) => {
    return apiCall(`/collections/${collectionId}/books`, {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    });
  },
};

// Reviews API
export const reviewsApi = {
  getByBook: async (bookId: string) => {
    return apiCall(`/reviews/book/${bookId}`, {
      method: 'GET',
    });
  },
  
  create: async (reviewData: any) => {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
  
  toggleLike: async (reviewId: string) => {
    return apiCall(`/reviews/${reviewId}/like`, {
      method: 'POST',
    });
  },
};

// Events API
export const eventsApi = {
  getAll: async (params?: { page?: number; limit?: number; featured?: boolean; upcoming?: boolean; type?: string; city?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.upcoming) queryParams.append('upcoming', 'true');
    if (params?.type) queryParams.append('type', params.type);
    if (params?.city) queryParams.append('city', params.city);
    const queryString = queryParams.toString();
    return apiCall(`/events${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  // Convenience: fetch only featured events
  getFeatured: async (limit = 4) => {
    return apiCall(`/events?featured=true&limit=${limit}`, { method: 'GET' });
  },
  getById: async (id: string) => apiCall(`/events/${id}`, { method: 'GET' }),
  rsvp: async (id: string, status = 'going') =>
    apiCall(`/events/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) }),
  // Admin: toggle featured flag
  toggleFeatured: async (id: string, isFeatured?: boolean) =>
    apiCall(`/events/${id}/feature`, {
      method: 'PUT',
      body: JSON.stringify(typeof isFeatured === 'boolean' ? { isFeatured } : {}),
    }),
};

// Giveaways API
export const giveawaysApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    return apiCall(`/giveaways${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  getById: async (id: string) => apiCall(`/giveaways/${id}`, { method: 'GET' }),
  enter: async (id: string) => apiCall(`/giveaways/${id}/enter`, { method: 'POST' }),
};

// Authors API
export const authorsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const queryString = queryParams.toString();
    return apiCall(`/authors${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  // convenience search wrapper
  search: async (q: string, limit = 10) => {
    const query = new URLSearchParams();
    if (q) query.append('search', q);
    if (limit) query.append('limit', limit.toString());
    return apiCall(`/authors?${query.toString()}`, { method: 'GET' });
  },
  getById: async (id: string) => apiCall(`/authors/${id}`, { method: 'GET' }),
  claim: async (id: string, data?: { email?: string; proof?: string }) =>
    apiCall(`/authors/${id}/claim`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  // Toggle follow/unfollow. Returns { success, isFollowing, followersCount }
  follow: async (id: string) => apiCall(`/authors/${id}/follow`, { method: 'POST' }),
  // Admin: list pending claim requests
  getClaimRequests: async (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    return apiCall(`/authors/claim-requests${q.toString() ? `?${q.toString()}` : ''}`, { method: 'GET' });
  },
  // Admin: approve or reject a claim
  updateClaimStatus: async (id: string, status: 'approved' | 'rejected') =>
    apiCall(`/authors/${id}/claim-status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  // Check current user's own claim status
  getMyClaim: async () => apiCall('/authors/my-claim', { method: 'GET' }),
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!tokenManager.getAccessToken();
};

// ─── Blogs API (public + editorial) ─────────────────────────────────────────
export const blogsApi = {
  getAll: async (params?: {
    page?: number; limit?: number; visibility?: string;
    type?: string; tag?: string; search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.visibility) q.append('visibility', params.visibility);
    if (params?.type) q.append('type', params.type);
    if (params?.tag) q.append('tag', params.tag);
    if (params?.search) q.append('search', params.search);
    return apiCall(`/blogs?${q.toString()}`, { method: 'GET' });
  },
  getBySlug: async (idOrSlug: string) => apiCall(`/blogs/${idOrSlug}`, { method: 'GET' }),
  create: async (formData: FormData) =>
    apiCall('/blogs', { method: 'POST', body: formData }),
  update: async (id: string, formData: FormData) =>
    apiCall(`/blogs/${id}`, { method: 'PUT', body: formData }),
  setVisibility: async (id: string, visibility: 'draft' | 'published' | 'featured') =>
    apiCall(`/blogs/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ visibility }) }),
  delete: async (id: string) =>
    apiCall(`/blogs/${id}`, { method: 'DELETE' }),
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: async () => apiCall('/admin/stats', { method: 'GET' }),
  getUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.role) q.append('role', params.role);
    if (params?.search) q.append('search', params.search);
    return apiCall(`/admin/users?${q.toString()}`, { method: 'GET' });
  },
  updateUser: async (id: string, data: { role?: string; isActive?: boolean; isSuspended?: boolean; suspendedReason?: string; suspendedDays?: number }) =>
    apiCall(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Giveaways admin
  createGiveaway: async (formData: FormData) => apiCall('/giveaways', { method: 'POST', body: formData }),
  updateGiveaway: async (id: string, formData: FormData) => apiCall(`/giveaways/${id}`, { method: 'PUT', body: formData }),
  publishGiveaway: async (id: string) => apiCall(`/giveaways/${id}/publish`, { method: 'PATCH' }),
  closeGiveaway: async (id: string) => apiCall(`/giveaways/${id}/close`, { method: 'PATCH' }),
  getGiveawayEntries: async (id: string, page = 1) => apiCall(`/giveaways/${id}/entries?page=${page}`, { method: 'GET' }),
  selectWinnersAuto: async (id: string) => apiCall(`/giveaways/${id}/select-winners`, { method: 'POST' }),
  selectWinnersManual: async (id: string, userIds: string[]) =>
    apiCall(`/giveaways/${id}/manual-winners`, { method: 'POST', body: JSON.stringify({ userIds }) }),
  deleteGiveaway: async (id: string) => apiCall(`/giveaways/${id}`, { method: 'DELETE' }),
};

// ─── Moderation API ──────────────────────────────────────────────────────────
export const moderationApi = {
  // Reviews
  getReviews: async (params?: {
    page?: number; limit?: number; reported?: boolean;
    hidden?: boolean; lowRating?: boolean; keyword?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.reported) q.append('reported', 'true');
    if (params?.hidden) q.append('hidden', 'true');
    if (params?.lowRating) q.append('lowRating', 'true');
    if (params?.keyword) q.append('keyword', params.keyword);
    return apiCall(`/admin/moderation/reviews?${q.toString()}`, { method: 'GET' });
  },
  hideReview: async (id: string) => apiCall(`/admin/moderation/reviews/${id}/hide`, { method: 'PATCH' }),
  unhideReview: async (id: string) => apiCall(`/admin/moderation/reviews/${id}/unhide`, { method: 'PATCH' }),
  deleteReview: async (id: string) => apiCall(`/admin/moderation/reviews/${id}`, { method: 'DELETE' }),
  dismissReviewReports: async (id: string) =>
    apiCall(`/admin/moderation/reviews/${id}/dismiss-reports`, { method: 'PATCH' }),

  // Comments
  getComments: async (params?: { page?: number; reported?: boolean; hidden?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.reported) q.append('reported', 'true');
    if (params?.hidden) q.append('hidden', 'true');
    return apiCall(`/admin/moderation/comments?${q.toString()}`, { method: 'GET' });
  },
  hideComment: async (id: string) => apiCall(`/admin/moderation/comments/${id}/hide`, { method: 'PATCH' }),
  deleteComment: async (id: string) => apiCall(`/admin/moderation/comments/${id}`, { method: 'DELETE' }),

  // Users
  warnUser: async (userId: string, reason: string) =>
    apiCall(`/admin/moderation/users/${userId}/warn`, { method: 'POST', body: JSON.stringify({ reason }) }),
  suspendUser: async (userId: string, reason: string, duration?: number) =>
    apiCall(`/admin/moderation/users/${userId}/suspend`, { method: 'POST', body: JSON.stringify({ reason, duration }) }),
  unsuspendUser: async (userId: string) =>
    apiCall(`/admin/moderation/users/${userId}/unsuspend`, { method: 'POST' }),

  // Clubs
  getClubs: async (params?: { page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page)   q.append('page',   params.page.toString());
    if (params?.status) q.append('status', params.status);
    return apiCall(`/admin/moderation/clubs?${q.toString()}`, { method: 'GET' });
  },
  approveClub: async (id: string) => apiCall(`/admin/moderation/clubs/${id}/approve`, { method: 'PATCH' }),
  rejectClub:  async (id: string, reason?: string) =>
    apiCall(`/admin/moderation/clubs/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  featureClub: async (id: string) => apiCall(`/admin/moderation/clubs/${id}/feature`, { method: 'PATCH' }),
  suspendClub: async (id: string, reason?: string) =>
    apiCall(`/admin/moderation/clubs/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  removeClub:  async (id: string) => apiCall(`/admin/moderation/clubs/${id}`, { method: 'DELETE' }),
};

// Admin Clubs API — full CRUD + moderation
export const adminClubsApi = {
  getAll: async (params?: { status?: string; featured?: boolean; search?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status)   q.append('status',   params.status);
    if (params?.featured) q.append('featured', 'true');
    if (params?.search)   q.append('search',   params.search);
    if (params?.page)     q.append('page',     params.page.toString());
    return apiCall(`/admin/clubs${q.toString() ? `?${q}` : ''}`, { method: 'GET' });
  },
  create:  async (formData: FormData) =>
    apiCall('/admin/clubs', { method: 'POST', body: formData }),
  update:  async (id: string, formData: FormData) =>
    apiCall(`/admin/clubs/${id}`, { method: 'PUT', body: formData }),
  approve: async (id: string) =>
    apiCall(`/admin/clubs/${id}/approve`, { method: 'PATCH' }),
  reject:  async (id: string, reason?: string) =>
    apiCall(`/admin/clubs/${id}/reject`,  { method: 'PATCH', body: JSON.stringify({ reason }) }),
  suspend: async (id: string, reason?: string) =>
    apiCall(`/admin/clubs/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  restore: async (id: string) =>
    apiCall(`/admin/clubs/${id}/restore`, { method: 'PATCH' }),
  delete:  async (id: string) =>
    apiCall(`/admin/clubs/${id}`, { method: 'DELETE' }),
};

// ─── Admin Books API ─────────────────────────────────────────────────────────
export const adminBooksApi = {
  // List all books (admin view) — optional ?status=pending|approved|rejected&search=&createdByType=
  getAll: async (params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    search?: string;
    createdByType?: 'user' | 'admin';
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.createdByType) q.append('createdByType', params.createdByType);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    return apiCall(`/admin/books?${q.toString()}`, { method: 'GET' });
  },

  // Single book detail (includes last 5 audit log entries)
  getBook: async (id: string) =>
    apiCall(`/admin/books/${id}`, { method: 'GET' }),

  // Admin create book (full metadata, goes live immediately)
  create: async (formData: FormData) =>
    apiCall('/admin/books', { method: 'POST', body: formData }),

  // Edit any field (pre-approval enrichment or regular edits)
  update: async (id: string, formData: FormData) =>
    apiCall(`/admin/books/${id}`, { method: 'PUT', body: formData }),

  // Approve pending book (optionally patch metadata at approval time)
  approve: async (id: string, formData?: FormData) =>
    apiCall(`/admin/books/${id}/approve`, {
      method: 'POST',
      body: formData ?? new FormData(),
    }),

  // Reject pending book with a reason
  reject: async (id: string, reason: string) =>
    apiCall(`/admin/books/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Polls API
export const pollsApi = {
  // Public – get active poll (with optional auth for userVotedBook)
  getActive: async () => apiCall('/polls/active', { method: 'GET' }),

  // Admin – get all polls
  getAll: async () => apiCall('/polls', { method: 'GET' }),

  // Admin – create poll
  create: async (data: { title?: string; year?: number; bookIds: string[]; status?: string }) =>
    apiCall('/polls', { method: 'POST', body: JSON.stringify(data) }),

  // Admin – update poll
  update: async (id: string, data: { title?: string; year?: number; bookIds?: string[]; status?: string }) =>
    apiCall(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin – delete poll
  delete: async (id: string) => apiCall(`/polls/${id}`, { method: 'DELETE' }),

  // Authenticated user – cast/change vote
  vote: async (pollId: string, bookId: string) =>
    apiCall(`/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ bookId }) }),
};

// Admin Events API
export const adminEventsApi = {
  getAll: async (params?: { status?: string; featured?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.featured) q.append('featured', 'true');
    const qs = q.toString();
    return apiCall(`/admin/events${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
  create: async (formData: FormData) =>
    apiCall('/admin/events', { method: 'POST', body: formData }),
  update: async (id: string, formData: FormData) =>
    apiCall(`/admin/events/${id}`, { method: 'PUT', body: formData }),
  delete: async (id: string) =>
    apiCall(`/admin/events/${id}`, { method: 'DELETE' }),
};

export default authApi;

