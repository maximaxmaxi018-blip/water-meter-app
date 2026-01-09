<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
=======
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19

// Типы ответов
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: any;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('water_auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('water_auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('water_auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // ===== AUTHENTICATION =====
  async login(accountNumber: string, password?: string): Promise<AuthResponse> {
<<<<<<< HEAD
    return this.request<AuthResponse>('/api/auth/login', {
=======
    return this.request<AuthResponse>('/auth/login', {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
      method: 'POST',
      body: JSON.stringify({ accountNumber, password: password || '' }),
    });
  }

  async changePassword(
    accountNumber: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
<<<<<<< HEAD
    return this.request('/api/auth/change-password', {
=======
    return this.request('/auth/change-password', {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
      method: 'POST',
      body: JSON.stringify({ accountNumber, oldPassword, newPassword }),
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user: any }> {
    if (!this.token) return { valid: false, user: null };
    
    try {
<<<<<<< HEAD
      return await this.request('/api/auth/verify', {
=======
      return await this.request('/auth/verify', {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
        headers: { Authorization: `Bearer ${this.token}` },
      });
    } catch {
      this.clearToken();
      return { valid: false, user: null };
    }
  }

  // ===== USERS =====
  async getUsers(): Promise<any[]> {
<<<<<<< HEAD
    return this.request('/api/users');
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: any): Promise<{ id: string; message: string }> {
    return this.request('/api/users', {
=======
    return this.request('/users');
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any): Promise<{ id: string; message: string }> {
    return this.request('/users', {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any): Promise<{ message: string }> {
<<<<<<< HEAD
    return this.request(`/api/users/${id}`, {
=======
    return this.request(`/users/${id}`, {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
<<<<<<< HEAD
    return this.request(`/api/users/${id}`, {
=======
    return this.request(`/users/${id}`, {
>>>>>>> ba2a6083e025fd17ad561633e28a0fe7cee17b19
      method: 'DELETE',
    });
  }

  // Generic POST method
  async post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== READINGS =====
  async getReadings(): Promise<any[]> {
    return this.request('/readings');
  }

  async getUserReadings(userId: string): Promise<any[]> {
    return this.request(`/readings/user/${userId}`);
  }

  async createReading(readingData: any): Promise<{ id: string; message: string }> {
    return this.request('/readings', {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }

  async updateReading(id: string, readingData: any): Promise<{ message: string }> {
    return this.request(`/readings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(readingData),
    });
  }

  async deleteReading(id: string): Promise<{ message: string }> {
    return this.request(`/readings/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== APPLICATIONS =====
  async getApplications(): Promise<any[]> {
    return this.request('/applications');
  }

  async getUserApplications(userId: string): Promise<any[]> {
    return this.request(`/applications/user/${userId}`);
  }

  async createApplication(appData: any): Promise<{ id: string; message: string }> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
  }

  async updateApplication(id: string, appData: any): Promise<{ message: string }> {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appData),
    });
  }

  async deleteApplication(id: string): Promise<{ message: string }> {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== NEWS =====
  async getNews(): Promise<any[]> {
    return this.request('/news');
  }

  async getNewsBySettlement(settlement: string): Promise<any[]> {
    return this.request(`/news/settlement/${settlement}`);
  }

  async createNews(newsData: any): Promise<{ id: string; message: string }> {
    return this.request('/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  }

  async updateNews(id: string, newsData: any): Promise<{ message: string }> {
    return this.request(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });
  }

  async deleteNews(id: string): Promise<{ message: string }> {
    return this.request(`/news/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== FEEDBACK =====
  async getFeedback(): Promise<any[]> {
    return this.request('/feedback');
  }

  async getUserFeedback(userId: string): Promise<any[]> {
    return this.request(`/feedback/user/${userId}`);
  }

  async createFeedback(feedbackData: any): Promise<{ id: string; message: string }> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async updateFeedback(id: string, feedbackData: any): Promise<{ message: string }> {
    return this.request(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feedbackData),
    });
  }

  async deleteFeedback(id: string): Promise<{ message: string }> {
    return this.request(`/feedback/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== PLUMBERS =====
  async getPlumbers(): Promise<any[]> {
    return this.request('/plumbers');
  }

  async createPlumber(plumberData: any): Promise<{ id: string; message: string }> {
    return this.request('/plumbers', {
      method: 'POST',
      body: JSON.stringify(plumberData),
    });
  }

  async updatePlumber(id: string, plumberData: any): Promise<{ message: string }> {
    return this.request(`/plumbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plumberData),
    });
  }

  async deletePlumber(id: string): Promise<{ message: string }> {
    return this.request(`/plumbers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
