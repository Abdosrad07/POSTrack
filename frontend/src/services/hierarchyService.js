import api from './api';

/**
 * Service pour la récupération de la hiérarchie Partenaire → DSM → POS → BTS
 * respectant la portée d'accès (AccessScope) de l'utilisateur connecté.
 */
export const hierarchyService = {
  /**
   * Récupère l'arborescence complète visible pour l'utilisateur.
   * @returns {Promise<Array>} Liste des partenaires avec leurs DSMs, POS et BTS.
   */
  async getHierarchy() {
    const response = await api.get('/hierarchy', { skipPartnerPrefix: true });
    return response.data;
  },
};

export default hierarchyService;
