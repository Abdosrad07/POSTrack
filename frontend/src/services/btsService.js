import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeBts = (bts) => ({
  ...bts,
  id: bts?.id,
  code: bts?.code ?? bts?.code_bts ?? '',
  code_bts: bts?.code_bts ?? bts?.code ?? '',
  nom: bts?.nom ?? bts?.name ?? '',
  name: bts?.name ?? bts?.nom ?? '',
  localisation: bts?.localisation ?? bts?.ville ?? '',
  statut: bts?.statut ?? bts?.status ?? 'ACTIF',
});

export const btsService = {
  getAll: async (params) => {
    const response = await api.get('/bts', { params });
    const list = normalizeList(response.data).map(normalizeBts);
    return { ...response, data: { ...(response.data || {}), items: list } };
  },
};

export default btsService;
