// ✅ Correct API base URL fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SubLink {
  title?: string;
  url?: string;
  image_url?: string;
}

// Admin Article shape aligned with backend while keeping existing fields
export interface Article {
  id?: string;
  // Core
  title: string;
  slug?: string;
  // Admin-side fields
  excerpt: string; // maps to backend summary
  content: string; // not persisted in backend currently
  featuredImage?: string; // maps to backend image_url
  category: string; // maps to backend section
  page?: string; // backend page
  author?: string;
  status: 'published' | 'draft'; // maps to backend is_live
  // Feature flags
  isAudioPick?: boolean; // for AudioCarousel
  isHot?: boolean; // for HotNews
  // Backend-aligned optional fields for compatibility
  summary?: string;
  image_url?: string;
  is_live?: boolean;
  section?: string;
  subLinks?: SubLink[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ✅ Helper to handle fetch responses consistently
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const json = await response.json();
  if (!response.ok) {
    return {
      success: false,
      message: json.message || response.statusText,
    };
  }
  // Ensure consistent shape
  return {
    success: true,
    data: json.data ?? json, // if backend doesn't wrap in {data}, fallback to raw json
    message: json.message,
  };
}

// Articles API
export const articlesApi = {
  async getAll(limit?: number, offset?: number): Promise<ApiResponse<Article[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await fetch(`${API_BASE_URL}/articles?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
    });
    const json = await response.json();
    
    return {
      success: response.ok,
      data: json.articles || [], // Backend returns { articles: [...] }
      message: json.message,
    };
  },

  async getById(id: string): Promise<ApiResponse<Article>> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
    });
    return handleResponse<Article>(response);
  },

  async create(article: Article): Promise<ApiResponse<Article>> {
    const payload = {
      section: article.category || 'general',
      title: article.title,
      slug: article.slug || null,
      image_url: article.featuredImage || null,
      summary: article.excerpt || null,
      is_live: article.status === 'published',
      page: article.page || 'Home',
      isAudioPick: article.isAudioPick || false,
      isHot: article.isHot || false,
      subLinks: Array.isArray(article.subLinks) ? article.subLinks : [],
    };

    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Article>(response);
  },

  async update(id: string, article: Partial<Article>): Promise<ApiResponse<Article>> {
    const payload = {
      section: article.category,
      title: article.title,
      slug: article.slug,
      image_url: article.featuredImage,
      summary: article.excerpt,
      is_live: article.status === 'published',
      page: article.page,
      isAudioPick: article.isAudioPick || false,
      isHot: article.isHot || false,
      subLinks: Array.isArray(article.subLinks) ? article.subLinks : [],
    };

    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Article>(response);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      },
    });
    return handleResponse<null>(response);
  },
};

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await handleResponse<{ token: string; user?: unknown }>(response);
    if (result.success && result.data && (result.data as any).token) {
      const { token, user } = result.data as any;
      localStorage.setItem('adminToken', token);
      if (user) localStorage.setItem('adminUser', JSON.stringify(user));
    }
    return result;
  },

  async signup(name: string, email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await fetch(`${API_BASE_URL}/admin/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const result = await handleResponse<{ token: string; user?: unknown }>(response);
    if (result.success && result.data && (result.data as any).token) {
      const { token, user } = result.data as any;
      localStorage.setItem('adminToken', token);
      if (user) localStorage.setItem('adminUser', JSON.stringify(user));
    }
    return result;
  },

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  getToken() {
    return localStorage.getItem('adminToken');
  },

  getUser() {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },

  getRememberedEmail() {
    return localStorage.getItem('rememberEmail');
  },

  setRememberedEmail(email: string) {
    localStorage.setItem('rememberEmail', email);
  },

  clearRememberedEmail() {
    localStorage.removeItem('rememberEmail');
  },
};