/**
 * API Service for Employee Management System
 */

const API_BASE_URL = '/api';

export const AuthStorage = {
  getToken() {
    return localStorage.getItem('emp_auth_token');
  },
  setToken(token) {
    localStorage.setItem('emp_auth_token', token);
  },
  getUser() {
    const userStr = localStorage.getItem('emp_auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser(userData) {
    localStorage.setItem('emp_auth_user', JSON.stringify(userData));
  },
  clearSession() {
    localStorage.removeItem('emp_auth_token');
    localStorage.removeItem('emp_auth_user');
  },
  isAuthenticated() {
    return !!this.getToken();
  }
};

/**
 * Universal fetch wrapper for API calls
 */
export async function apiRequest(endpoint, options = {}) {
  const token = AuthStorage.getToken();
  const headers = options.headers || {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle token expiration / unauthorized
    if (response.status === 401 || response.status === 403) {
      const data = await response.json().catch(() => ({}));
      const isLoginEndpoint = endpoint.includes('/auth/login');
      if (!isLoginEndpoint && (data.message === "Token Expired" || response.status === 401)) {
        AuthStorage.clearSession();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw new Error(data.message || data.error || 'Authentication error');
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error ${response.status}`);
      }
      return data;
    } else {
      // Blob or text
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response;
    }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
