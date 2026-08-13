import api from './api';

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@postrack.local',
    password: 'admin123',
    role: 'ADMIN',
    full_name: 'Admin Demo',
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@postrack.local',
    password: 'manager123',
    role: 'MANAGER',
    full_name: 'Manager Demo',
  },
  {
    id: 3,
    username: 'dsm',
    email: 'dsm@postrack.local',
    password: 'dsm123',
    role: 'DSM',
    full_name: 'DSM Demo',
  },
  {
    id: 4,
    username: 'viewer',
    email: 'viewer@postrack.local',
    password: 'viewer123',
    role: 'VIEWER',
    full_name: 'Viewer Demo',
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

const saveMockSession = (user) => {
  const access_token = `mock-token-${user.username}`;
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  return {
    access_token,
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
      const response = await api.post('/auth/login', payload);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        try {
          const userResponse = await api.get('/auth/me');
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          return { ...response.data, user: userResponse.data };
        } catch {
          localStorage.setItem('user', JSON.stringify({}));
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

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      throw error;
    }
  },
};

