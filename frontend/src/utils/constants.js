/** Clés localStorage — Module A1 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  PARTNER_CONTEXT_ID: 'partner_context_id',
  PARTNER_CONTEXT: 'partner_context',
};

/** Rôles applicatifs cible (ADMIN / MANAGER / CHEF_OPERATIONNEL / OPERATIONNEL). */
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CHEF_OPERATIONNEL: 'CHEF_OPERATIONNEL',
  OPERATIONNEL: 'OPERATIONNEL',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.CHEF_OPERATIONNEL]: 'Chef opérationnel',
  [ROLES.OPERATIONNEL]: 'Opérationnel',
};

/** Groupes de rôles réutilisables (matrice d'accès cible). */
export const ROLE_GROUPS = {
  ALL: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF_OPERATIONNEL, ROLES.OPERATIONNEL],
  PARTNER_PORTFOLIO: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF_OPERATIONNEL],
  OPERATIONS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CHEF_OPERATIONNEL, ROLES.OPERATIONNEL],
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
    roles: ROLE_GROUPS.OPERATIONS,
  },
  {
    id: 'bts',
    to: '/bts',
    label: 'BTS',
    roles: ROLE_GROUPS.OPERATIONS,
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
  /^\/?hierarchy(\/|$)/i,
];

/** Types d'entités importables — Module A3 (Import Excel centralisé / ImportBatch) */
export const IMPORT_ENTITY_TYPES = [
  { value: 'POS', label: 'Points de Vente (POS)' },
  { value: 'DSM', label: 'DSM' },
  { value: 'BTS', label: 'BTS' },
  { value: 'SIM', label: 'Stock SIM' },
  { value: 'PERFORMANCE', label: 'Performance / Relevés' },
];

/** Chaîne d'acceptation des fichiers (input & drag & drop) — Module A3 */
export const IMPORT_FILE_ACCEPT = '.xlsx,.xls,.csv';

/** Statuts possibles d'un lot d'import (ImportBatch) — Module A3 */
export const IMPORT_BATCH_STATUS = {
  VALIDATED: 'VALIDATED',
  APPLIED: 'APPLIED',
  REJECTED: 'REJECTED',
};

/** Étapes du parcours d'import (Module A3) */
export const IMPORT_STEPS = {
  SETUP: 'SETUP',
  VALIDATING: 'VALIDATING',
  PREVIEW: 'PREVIEW',
  APPLYING: 'APPLYING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};
