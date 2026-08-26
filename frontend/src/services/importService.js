import api, { applyPartnerPrefix } from './api';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Service du Module A3 — Import Excel centralisé (ImportBatch).
 *
 * Conformément au contrat Frontend (TEAM_DEVELOPMENT §7) :
 *   - POST  /partners/{id}/imports/validate
 *   - POST  /partners/{id}/imports/{batch_id}/apply
 *   - GET   /partners/{id}/imports/templates/{entity_type}  (gabarit officiel)
 *
 * Le préfixe /partners/{id}/ est automatiquement ajouté par l'intercepteur
 * Axios (services/api.js) à partir du partner_context_id.
 *
 * Source de vérité unique : aucune donnée d'import n'est simulée côté
 * client. En cas d'indisponibilité du backend, les erreurs sont propagées
 * à l'UI (états error dédiés).
 */

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const importService = {
  /**
   * Étape 3 — Dépôt & Validation du fichier.
   * @param {string} entityType
   * @param {File} file
   */
  async validate(entityType, file) {
    const body = new FormData();
    body.append('file', file);
    body.append('entity_type', entityType);

    const response = await importServicePost('/imports/validate', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeBatch(unwrap(response), entityType, file?.name);
  },

  /**
   * Étape 5 — Confirmation / Commit du lot validé.
   * @param {string} batchId
   */
  async apply(batchId) {
    const response = await api.post(`/imports/${batchId}/apply`, {});
    const result = unwrap(response);
    if (result && typeof result === 'object') return result;
    return { id: batchId, status: 'APPLIED' };
  },

  /** Consultation d'un lot (utile pour reprendre un import en cours). */
  async getBatch(batchId) {
    const response = await api.get(`/imports/${batchId}`);
    return normalizeBatch(unwrap(response));
  },

  /**
   * Étape 1 — URL du gabarit Excel officiel.
   * @param {string} entityType
   */
  getTemplateUrl(entityType) {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const path = `/imports/templates/${encodeURIComponent(entityType)}`;
    const partnerId = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
    // Les gabarits doivent rester accessibles sans contexte partenaire explicite.
    return partnerId ? `${base}${applyPartnerPrefix(path, partnerId)}` : `${base}${path}`;
  },
};

/**
 * Petit injecteur permettant de tester le service sans dépendre du client Axios
 * global (les tests mockeront api.default directement).
 */
const importServicePost = (url, body, config) => api.post(url, body, config);

/** Normalise un lot Backend vers la forme attendue par l'UI. */
function normalizeBatch(batch, entityType = 'POS', fileName = 'import.xlsx') {
  if (!batch || typeof batch !== 'object') {
    throw new Error("Réponse d'import invalide : le backend n'a renvoyé aucune donnée.");
  }
  return {
    id: batch.id,
    entity_type: batch.entity_type || entityType,
    status: batch.status || 'VALIDATED',
    file_name: batch.file_name || fileName,
    created_at: batch.created_at,
    columns: batch.columns || Object.keys(batch.rows?.[0]?.cells || {}) || [],
    rows: batch.rows || [],
    errors: batch.errors || batch.error_report?.errors || [],
    warnings: batch.warnings || batch.error_report?.warnings || [],
    summary: {
      total_lines: batch.summary?.total_lines ?? batch.total_lines ?? 0,
      created: batch.summary?.created ?? batch.created ?? 0,
      updated: batch.summary?.updated ?? batch.updated ?? 0,
      errors: batch.summary?.errors ?? batch.errors_count ?? 0,
      warnings: batch.summary?.warnings ?? batch.warnings_count ?? 0,
      status: batch.status || 'VALIDATED',
    },
  };
}

export default importService;