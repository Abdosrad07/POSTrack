import { ROLES, ROLE_LABELS } from './constants';

/** Alias backend legacy → nouveau rôle canonique. */
export const ROLE_ALIASES = {
  REPRESENTANT_PARTENAIRE: ROLES.MANAGER,
  REPRESENTANT_DSM: ROLES.CHEF_OPERATIONNEL,
  DETENTEUR_POS: ROLES.OPERATIONNEL,
  PARTENAIRE: ROLES.MANAGER,
  DSM: ROLES.CHEF_OPERATIONNEL,
  POS_HOLDER: ROLES.OPERATIONNEL,
};

/**
 * Normalise un rôle backend/legacy vers le rôle R7 canonique.
 * @param {string|null|undefined} role
 * @returns {string|null}
 */
export function normalizeRole(role) {
  if (!role) return null;
  const upper = String(role).toUpperCase();
  if (ROLE_ALIASES[upper]) return ROLE_ALIASES[upper];
  if (Object.values(ROLES).includes(upper)) return upper;
  return upper;
}

/**
 * Libellé affichable du rôle (après normalisation).
 */
export function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return 'Rôle inconnu';
  return ROLE_LABELS[normalized] || ROLE_LABELS[role] || normalized;
}

/**
 * Vérifie si l'utilisateur possède l'un des rôles autorisés.
 * @param {{ role?: string }|null} user
 * @param {string[]} allowedRoles — rôles R7 ou alias
 */
export function hasRole(user, allowedRoles = []) {
  if (!allowedRoles?.length) return true;
  const normalized = normalizeRole(user?.role);
  if (!normalized) return false;

  const allowed = allowedRoles.map((r) => normalizeRole(r)).filter(Boolean);
  return allowed.includes(normalized);
}

/**
 * Filtre les entrées de navigation selon le rôle connecté.
 */
export function filterNavByRole(navItems, user) {
  return (navItems || []).filter((item) => hasRole(user, item.roles));
}

export default {
  normalizeRole,
  getRoleLabel,
  hasRole,
  filterNavByRole,
  ROLE_ALIASES,
};
