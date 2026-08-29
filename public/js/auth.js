import { apiRequest, AuthStorage } from './api.js';

export const AuthModule = {
  async login(username, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ Username: username, Password: password })
    });

    if (data.status && data.token) {
      AuthStorage.setToken(data.token);
      AuthStorage.setUser(data);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  },

  async signup(signupData) {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData)
    });
    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Logout API failed, clearing local session anyway:", e);
    } finally {
      AuthStorage.clearSession();
    }
  },

  async getRegistrations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/auth/registrations${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, { method: 'GET' });
  }
};
