import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const persistTokens = ({ access_token, refresh_token }) => {
  if (access_token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
  }
  if (refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
  }
};

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT);
};

export const authService = {
  async login(credentials) {
    const payload = {
      username: credentials.username || credentials.email,
      password: credentials.password,
    };

    try {
      const response = await api.post('/auth/login', payload, {
        skipPartnerPrefix: true,
      });
      if (response.data.access_token) {
        persistTokens(response.data);
        try {
          const userResponse = await api.get('/auth/me', {
            skipPartnerPrefix: true,
          });
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data));
          return { ...response.data, user: userResponse.data };
        } catch {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({}));
          return { ...response.data, user: {} };
        }
      }
      return response.data;
    } catch (error) {
      // Source de vérité unique : si le backend est injoignable, l'échec est
      // propagé. Aucune session simulée n'est créée côté client.
      throw error;
    }
  },

  async refresh() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    const response = await api.post(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipPartnerPrefix: true }
    );
    persistTokens(response.data);
    return response.data;
  },

  async logout() {
    clearSession();
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me', { skipPartnerPrefix: true });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser && storedUser !== 'undefined') {
        try {
          return JSON.parse(storedUser);
        } catch {
          return {};
        }
      }
      throw error;
    }
  },
};

export default authService;
