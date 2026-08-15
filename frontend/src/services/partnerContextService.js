import api from './api';
import { getMockPartnersForRole, mockPartners } from '../mocks/partners';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

/**
 * Partenaires autorisés pour l'utilisateur connecté.
 * Contrat cible R7 : GET /partenaires/available (fallback GET /partenaires).
 */
export const partnerContextService = {
  async getAvailable(user) {
    try {
      try {
        const response = await api.get('/partenaires/available', {
          skipPartnerPrefix: true,
        });
        return normalizeList(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          const response = await api.get('/partenaires', {
            params: { limit: 100, statut: 'ACTIF' },
            skipPartnerPrefix: true,
          });
          return normalizeList(response.data);
        }
        throw error;
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return getMockPartnersForRole(user?.role) || mockPartners;
      }
      throw error;
    }
  },
};

export default partnerContextService;
