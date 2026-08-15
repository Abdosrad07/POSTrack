/** Clés localStorage — Module A1 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  PARTNER_CONTEXT_ID: 'partner_context_id',
  PARTNER_CONTEXT: 'partner_context',
};

/** Rôles applicatifs v3.1-R7 (+ alias backend legacy) */
export const ROLES = {
  ADMIN: 'ADMIN',
  REPRESENTANT_PARTENAIRE: 'REPRESENTANT_PARTENAIRE',
  REPRESENTANT_DSM: 'REPRESENTANT_DSM',
  DETENTEUR_POS: 'DETENTEUR_POS',
  /** Alias backend actuel */
  MANAGER: 'MANAGER',
  DSM: 'DSM',
  VIEWER: 'VIEWER',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.REPRESENTANT_PARTENAIRE]: 'Représentant Partenaire',
  [ROLES.REPRESENTANT_DSM]: 'Représentant DSM',
  [ROLES.DETENTEUR_POS]: 'Détenteur POS',
  [ROLES.MANAGER]: 'Manager / Représentant Partenaire',
  [ROLES.DSM]: 'Représentant DSM',
  [ROLES.VIEWER]: 'Détenteur POS / Lecteur',
};

/** Groupes de rôles réutilisables (matrice A2) */
export const ROLE_GROUPS = {
  ALL: [
    ROLES.ADMIN,
    ROLES.REPRESENTANT_PARTENAIRE,
    ROLES.REPRESENTANT_DSM,
    ROLES.DETENTEUR_POS,
  ],
  PARTNER_PORTFOLIO: [ROLES.ADMIN, ROLES.REPRESENTANT_PARTENAIRE],
  NETWORK_OPS: [
    ROLES.ADMIN,
    ROLES.REPRESENTANT_PARTENAIRE,
    ROLES.REPRESENTANT_DSM,
  ],
  ADMIN_ONLY: [ROLES.ADMIN],
};

/**
 * Navigation principale — filtrée par RoleGuard / Sidebar selon le rôle R7.
 * Accès métier (TEAM_DEVELOPMENT §6 + NEW_VERSION).
 */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    to: '/',
    label: 'Dashboard',
    end: true,
    roles: ROLE_GROUPS.ALL,
  },
  {
    id: 'pos',
    to: '/pos',
    label: 'POS',
    roles: ROLE_GROUPS.ALL,
  },
  {
    id: 'dsm',
    to: '/dsm',
    label: 'DSM',
    roles: ROLE_GROUPS.NETWORK_OPS,
  },
  {
    id: 'bts',
    to: '/bts',
    label: 'BTS',
    roles: ROLE_GROUPS.NETWORK_OPS,
  },
  {
    id: 'clients',
    to: '/clients',
    label: 'Clients',
    roles: ROLE_GROUPS.ALL,
  },
  {
    id: 'sims',
    to: '/sims',
    label: 'Stock SIM',
    roles: ROLE_GROUPS.ALL,
  },
  {
    id: 'primes',
    to: '/primes',
    label: 'Primes',
    roles: ROLE_GROUPS.PARTNER_PORTFOLIO,
  },
  {
    id: 'requetes',
    to: '/requetes',
    label: 'Requêtes',
    roles: ROLE_GROUPS.ALL,
  },
  {
    id: 'import-export',
    to: '/import-export',
    label: 'Import Excel',
    roles: ROLE_GROUPS.PARTNER_PORTFOLIO,
  },
  {
    id: 'partenaires',
    to: '/partenaires',
    label: 'Partenaires',
    roles: ROLE_GROUPS.ADMIN_ONLY,
  },
  {
    id: 'audit',
    to: '/audit',
    label: 'Audit',
    roles: ROLE_GROUPS.ADMIN_ONLY,
  },
];

/** Chemins exclus du préfixe /partners/{id}/ */
export const PARTNER_PREFIX_EXCLUDES = [
  /^\/?auth(\/|$)/i,
  /^\/?partenaires(\/|$)/i,
  /^\/?partners\/available(\/|$)/i,
];
