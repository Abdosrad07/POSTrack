import axios from 'axios';
import { PARTNER_PREFIX_EXCLUDES, STORAGE_KEYS } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Client sans intercepteurs — refresh JWT uniquement */
const refreshClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const shouldSkipPartnerPrefix = (config) => {
  if (config.skipPartnerPrefix) return true;
  const url = config.url || '';
  const path = url.startsWith('http') ? new URL(url).pathname.replace(/^\/api/, '') : url;
  return PARTNER_PREFIX_EXCLUDES.some((pattern) => pattern.test(path));
};

const isPartnerScopedRequest = (config) => !shouldSkipPartnerPrefix(config);

/**
 * Réécrit les URLs métier en /partners/{partner_id}/...
 * Ex. /pos → /partners/3/pos
 */
export const applyPartnerPrefix = (url, partnerId) => {
  if (!url || !partnerId) return url;
  if (url.startsWith('http')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  if (normalized.startsWith('/partners/')) return normalized;
  return `/partners/${partnerId}${normalized}`;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const partnerId = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);

    if (isPartnerScopedRequest(config)) {
      if (!partnerId) {
        return Promise.reject(
          Object.assign(new Error('Aucun partenaire sélectionné (partner_context_id manquant).'), {
            code: 'NO_PARTNER_CONTEXT',
            config,
          })
        );
      }
      config.url = applyPartnerPrefix(config.url, partnerId);
      config.headers['X-Partner-Context-Id'] = partnerId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.code === 'NO_PARTNER_CONTEXT') {
      if (window.location.pathname !== '/select-partner' && window.location.pathname !== '/login') {
        window.location.href = '/select-partner';
      }
      return Promise.reject(error);
    }

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    if (isAuthEndpoint || originalRequest._retry) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      isRefreshing = false;
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    try {
      const { data } = await refreshClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }

      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
