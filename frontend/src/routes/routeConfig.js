/**
 * Configuration des routes — Modules A1 / A2 (Lead Frontend)
 * Source de vérité runtime : App.tsx
 */
export const PUBLIC_ROUTES = {
  login: '/login',
};

export const AUTH_ROUTES = {
  selectPartner: '/select-partner',
  unauthorized: '/unauthorized',
};

export const APP_ROUTES = {
  dashboard: '/',
  pos: '/pos',
  dsm: '/dsm',
  bts: '/bts',
  sims: '/sims',
  primes: '/primes',
  requetes: '/requetes',
  importExport: '/import-export',
  partenaires: '/partenaires',
  audit: '/audit',
};

export default {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  APP_ROUTES,
};
