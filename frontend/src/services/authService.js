import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user || {}));
    }
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

