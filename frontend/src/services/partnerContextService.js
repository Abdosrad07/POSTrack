import api from './api';
import { getMockPartnersForRole, mockPartners } from '../mocks/partners';
import btsDebug from '../utils/btsDebug';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

/**
 * Partenaires autorisés pour l'utilisateur connecté.
 * Contrat cible R7 : GET /auth/partenaires/available (fallback GET /partenaires).
 */
export const partnerContextService = {
  async getAvailable(user) {
    try {
      btsDebug.log('Chargement du contexte partenaire', { role: user?.role, user: user?.email || user?.nom_complet })
      try {
        const response = await api.get('/auth/partenaires/available', {
          skipPartnerPrefix: true,
          headers: {
            'X-Skip-Partner-Context': 'true',
          },
        });
        btsDebug.snapshot('Réponse auth/partenaires/available', response.data)
        return normalizeList(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          btsDebug.warn('Route /auth/partenaires/available introuvable, fallback sur /partenaires')
          const response = await api.get('/partenaires', {
            params: { limit: 100, statut: 'ACTIF' },
            skipPartnerPrefix: true,
          });
          btsDebug.snapshot('Réponse partenaires fallback', response.data)
          return normalizeList(response.data);
        }
        throw error;
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        btsDebug.warn('Réseau indisponible pour les partenaires, fallback mock')
        const fallback = getMockPartnersForRole(user?.role) || mockPartners;
        return fallback.map((partner) => ({ ...partner, __mock: true }));
      }
      btsDebug.error('Erreur partenaires', error?.response?.status, error?.response?.data || error.message)
      throw error;
    }
  },
};

export default partnerContextService;
