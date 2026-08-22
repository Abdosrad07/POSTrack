import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { clearAuthSession } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      if (storedUser && storedUser !== 'undefined') {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({});
        }
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } catch (error) {
        if (error.isAuthExpired || error.response?.status === 401 || error.response?.status === 403) {
          clearAuthSession();
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setToken(data.access_token);
      setUser(data.user || {});
      return data;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
    role: user?.role || null,
    partnerId: user?.partner_id ?? user?.partnerId ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
