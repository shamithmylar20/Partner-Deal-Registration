// src/services/apiClient.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

class ApiClient {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async googleLogin() {
    window.location.href = `${this.baseURL}/auth/google`;
  }

  async submitDeal(dealData) {
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
  }

  async getDeals() {
    return this.request('/deals');
  }

  async getDealStats() {
    return this.request('/deals/stats/summary');
  }

  async checkDuplicates(companyName, domain) {
    return this.request('/deals/check-duplicate', {
      method: 'POST',
      body: JSON.stringify({ companyName, domain }),
    });
  }
}

export default new ApiClient();