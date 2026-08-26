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
  
  /** POS du partenaire avec données métier enrichies */
  getPOS: (params) =>
    api.get('/pos/enriched', { params }),
  
  /** Statistiques de linkage POS du partenaire */
  getPOSLinkageStats: (dsmId = null) =>
    api.get('/pos/stats/linkage', { params: dsmId ? { dsm_id: dsmId } : {} }),
  
  /** Compteurs par type de POS du partenaire */
  getPOSTypeStats: (dsmId = null) =>
    api.get('/pos/stats/types', { params: dsmId ? { dsm_id: dsmId } : {} }),
};

export default partenaireService;
