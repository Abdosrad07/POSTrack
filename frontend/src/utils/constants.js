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

/** Chemins exclus du préfixe /partners/{id}/ */
export const PARTNER_PREFIX_EXCLUDES = [
  /^\/?auth(\/|$)/i,
  /^\/?partenaires(\/|$)/i,
  /^\/?partners\/available(\/|$)/i,
];
