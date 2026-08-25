import api from './api';

/** Référentiel partenaires (hors préfixe /partners/{id}/) */
export const partenaireService = {
  getAll: (params) =>
    api.get('/partenaires', { params, skipPartnerPrefix: true }),
  getAvailable: (params) =>
    api.get('/auth/partenaires/available', { params, skipPartnerPrefix: true }),
  /** Carte d'identité du partenaire courant (étape 5) — compteurs calculés côté backend. */
  getIdentity: (partnerId) =>
    api.get(`/partenaires/${partnerId}/identity`, { skipPartnerPrefix: true }),
};

export default partenaireService;
