import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@postrack.local',
    password: 'admin123',
    role: 'ADMIN',
    full_name: 'Admin Demo',
    nom_complet: 'Admin Demo',
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@postrack.local',
    password: 'manager123',
    role: 'MANAGER',
    full_name: 'Manager Demo',
    nom_complet: 'Manager Demo',
  },
  {
    id: 3,
    username: 'dsm',
    email: 'dsm@postrack.local',
    password: 'dsm123',
    role: 'DSM',
    full_name: 'DSM Demo',
    nom_complet: 'DSM Demo',
  },
  {
    id: 4,
    username: 'viewer',
    email: 'viewer@postrack.local',
    password: 'viewer123',
    role: 'VIEWER',
    full_name: 'Viewer Demo',
    nom_complet: 'Viewer Demo',
  },
];

const USERNAME_TO_EMAIL = {
  admin: 'admin@postrack.local',
  manager: 'manager@postrack.local',
  dsm: 'dsm@postrack.local',
  viewer: 'viewer@postrack.local',
};

const resolveEmail = ({ username, email, password }) => {
  if (email) return email;
  if (username && username.includes('@')) return username;
  if (username && USERNAME_TO_EMAIL[username]) return USERNAME_TO_EMAIL[username];
  const mockUser = mockUsers.find(
    (user) => user.username === username || user.email === username
  );
  return mockUser?.email || username;
};

const findMockUser = ({ username, password }) => {
  const email = resolveEmail({ username, password });
  return mockUsers.find(
    (user) =>
      (user.username === username || user.email === username || user.email === email) &&
      user.password === password
  );
};

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

const saveMockSession = (user) => {
  const access_token = `mock-token-${user.username}`;
  const refresh_token = `mock-refresh-${user.username}`;
  persistTokens({ access_token, refresh_token });
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return {
    access_token,
    refresh_token,
    token_type: 'bearer',
    user,
  };
};

export const authService = {
  async login(credentials) {
    const payload = {
      email: resolveEmail(credentials),
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
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const mockUser = findMockUser(credentials);
        if (mockUser) {
          return saveMockSession(mockUser);
        }
      }
      throw error;
    }
  },

  async refresh() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }

    if (refreshToken.startsWith('mock-refresh-')) {
      const access_token = refreshToken.replace('mock-refresh-', 'mock-token-');
      persistTokens({ access_token, refresh_token: refreshToken });
      return { access_token, refresh_token: refreshToken, token_type: 'bearer' };
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
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      throw error;
    }
  },
};

export default authService;
