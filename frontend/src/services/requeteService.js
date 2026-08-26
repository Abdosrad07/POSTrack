import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeRequete = (r) => ({
  ...r,
  id: r?.id,
  type_requete: r?.type_requete ?? '',
  titre: r?.titre ?? '',
  entite_en_charge: r?.entite_en_charge ?? null,
  date_creation: r?.date_creation ?? null,
  date_finalisation: r?.date_finalisation ?? null,
  closed_at: r?.closed_at ?? null,
  dsm_id: r?.dsm_id ?? null,
  dsm_name: r?.dsm_name ?? null,
  demandeur_name: r?.demandeur_name ?? null,
  statut: r?.statut ?? null,
  en_retard: r?.en_retard ?? false,
  delai_attente: r?.delai_attente ?? null,
});

export const requeteService = {
  /** Liste brute des requêtes du partenaire (Page[RequeteOut]). */
  list: async (params = {}) => {
    const response = await api.get('/requests', { params });
    const items = normalizeList(response.data).map(normalizeRequete);
    return { ...response, data: { ...(response.data || {}), items } };
  },

  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return { ...response, data: normalizeRequete(response.data) };
  },

  create: (payload) => api.post('/requests', payload),

  update: (id, payload) => api.patch(`/requests/${id}`, payload),

  /** Résumé des requêtes par DSM avec indicateurs de progression */
  getDSMSummary: async (dsmId) => {
    const response = await api.get(`/requests/dsm/${dsmId}/summary`);
    return response.data;
  },
};

export default requeteService;
