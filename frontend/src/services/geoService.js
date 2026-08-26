import api from './api';

/**
 * Service pour les donnees geographiques du territoire d'un partenaire.
 */
export const geoService = {
  /**
   * Recupere les donnees geographiques pour un partenaire donne.
   * @param {number} partnerId - ID du partenaire
   * @returns {Promise<Object>} Donnees geo avec bts, micro_zones, zones, territory
   */
  getPartnerGeo: (partnerId) =>
    api.get(`/partners/${partnerId}/geo`, { skipPartnerPrefix: true }),
};

export default geoService;