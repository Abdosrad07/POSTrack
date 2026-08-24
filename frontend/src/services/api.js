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

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT);
  redirectToLogin();
};

export const clearAuthSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
  localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT);
};

/** Ramène "/api/xxx" à "/xxx" (la baseURL contient déjà /api). */
const stripApiRoot = (url) =>
  url && !url.startsWith('http') && url.startsWith('/api/') ? url.slice(4) : url;

const shouldSkipPartnerPrefix = (config) => {
  if (config.skipPartnerPrefix) return true;
  const url = config.url || '';
  const path = url.startsWith('http') ? new URL(url).pathname.replace(/^\/api/, '') : url;
  return PARTNER_PREFIX_EXCLUDES.some((pattern) => pattern.test(path));
};

const isPartnerScopedRequest = (config) => !shouldSkipPartnerPrefix(config);

const extractErrorMessage = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map(extractErrorMessage).filter(Boolean).join(' · ') || null;
  }
  if (typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) return extractErrorMessage(data.detail);
    if (data.msg) return data.msg;
    if (data.message) return data.message;
    if (data.errors) return extractErrorMessage(data.errors);
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${extractErrorMessage(value)}`)
      .filter((item) => !item.endsWith(': null'))
      .join(' · ') || null;
  }
  return String(data);
};

const normalizeApiError = (error) => {
  const raw = error?.response?.data;
  const isNetworkError = !error?.response && (error?.code === 'ERR_NETWORK' || /network error/i.test(error?.message || ''));
  const message =
    extractErrorMessage(raw) ||
    (isNetworkError
      ? `Impossible de joindre le backend à l'adresse ${API_URL}. Vérifiez que l'API est démarrée et que VITE_API_URL pointe vers le bon serveur.`
      : error?.message || 'Erreur inattendue.');
  const isAuthExpired =
    (error?.response?.status === 401 || error?.response?.status === 403) &&
    /(expire|expir|revoqu|deconnect|invalid)/i.test(message.toLowerCase());
  return Object.assign(error, { message, apiMessage: message, isAuthExpired, isNetworkError });
};

/**
 * Réécrit les URLs métier en /partners/{partner_id}/...
 * Le résultat est RELATIF à la racine de l'API : la baseURL axios contient
 * déjà le préfixe /api (ex. http://localhost:8000/api), donc renvoyer
 * /api/partners/... produirait /api/api/partners/... côté serveur.
 * Ex. /pos → /partners/3/pos → GET http://localhost:8000/api/partners/3/pos
 */
export const applyPartnerPrefix = (url, partnerId) => {
  if (!url || !partnerId) return url;
  if (url.startsWith('http')) return url;
  const withoutApiRoot = url.startsWith('/api/') ? url.slice(4) : url;
  const normalized = withoutApiRoot.startsWith('/') ? withoutApiRoot : `/${withoutApiRoot}`;
  if (normalized.startsWith('/partners/')) return normalized;
  return `/partners/${partnerId}${normalized}`;
};

api.interceptors.request.use(
  (config) => {
    // Les chemins écrits en absolu ("/api/auth/...") sont ramenés à la
    // racine de l'API : la baseURL contient déjà /api, sinon axios
    // concatènerait et produirait "/api/api/..." (404 côté backend).
    config.url = stripApiRoot(config.url);

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
    normalizeApiError(error);
    const originalRequest = error.config;

    if (error.code === 'NO_PARTNER_CONTEXT') {
      if (window.location.pathname !== '/select-partner') {
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
