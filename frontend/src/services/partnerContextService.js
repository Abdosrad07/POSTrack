import api from './api';
import btsDebug from '../utils/btsDebug';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizePartner = (partner) => ({
  ...partner,
  id: partner?.id,
  name: partner?.name ?? partner?.nom ?? partner?.raison_sociale ?? '',
  code: partner?.code ?? partner?.code_partenaire ?? '',
  address: partner?.address ?? partner?.adresse ?? null,
  ville: partner?.ville ?? null,
  region: partner?.region ?? null,
});

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
        return normalizeList(response.data).map(normalizePartner);
      } catch (error) {
        btsDebug.warn('Échec de /auth/partenaires/available', {
          status: error?.response?.status,
          message: error?.message,
          data: error?.response?.data,
        })
        if (error.response?.status === 404) {
          btsDebug.warn('Route /auth/partenaires/available introuvable, fallback sur /partenaires')
          const response = await api.get('/partenaires', {
            params: { limit: 100, statut: 'ACTIF' },
            skipPartnerPrefix: true,
          });
          btsDebug.snapshot('Réponse partenaires fallback', response.data)
          return normalizeList(response.data).map(normalizePartner);
        }
        throw error;
      }
    } catch (error) {
      // Source de vérité unique : pas de référentiel partenaire simulé.
      // Sans backend joignable, l'échec est propagé vers l'écran de sélection.
      btsDebug.error('Erreur partenaires', error?.response?.status, error?.response?.data || error.message)
      throw error;
    }
  },
};

export default partnerContextService;
