
import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizePos = (pos) => ({
  ...pos,
  id: pos?.id,
  code_pos: pos?.code_pos ?? pos?.code ?? '',
  name: pos?.name ?? pos?.nom ?? '',
  nom: pos?.nom ?? pos?.name ?? '',
  type_pos: pos?.type_pos ?? pos?.type ?? null,
  statut: pos?.statut ?? pos?.status ?? null,
  date_expiration: pos?.date_expiration ?? null,
  partenaire: pos?.partenaire ? {
    ...pos.partenaire,
    id: pos.partenaire.id,
    name: pos.partenaire.name ?? pos.partenaire.nom ?? '',
    nom: pos.partenaire.nom ?? pos.partenaire.name ?? '',
    code: pos.partenaire.code ?? pos.partenaire.code_partenaire ?? '',
    code_partenaire: pos.partenaire.code_partenaire ?? pos.partenaire.code ?? '',
  } : pos?.partenaire,
  dsm: pos?.dsm ? {
    ...pos.dsm,
    id: pos.dsm.id,
    full_name: pos.dsm.full_name ?? pos.dsm.nom_complet ?? '',
    nom_complet: pos.dsm.nom_complet ?? pos.dsm.full_name ?? '',
  } : pos?.dsm,
});

export const posService = {
  getAll: async (params) => {
    const response = await api.get('/pos', { params });
    const list = normalizeList(response.data).map(normalizePos);
    return { ...response, data: { ...(response.data || {}), items: list } };
  },
  getById: async (id) => {
    const response = await api.get(`/pos/${id}`);
    const data = response.data ? normalizePos(response.data) : response.data;
    return { ...response, data };
  },
  create: (data) => api.post('/pos', data),
  update: (id, data) => api.put(`/pos/${id}`, data),
  remove: (id) => api.delete(`/pos/${id}`),

  changeStatus: (id, statut) => api.patch(`/pos/${id}/status`, { statut }),

  reconduire: (id, data) => api.post(`/pos/${id}/reconduction`, data),

  getLinks: (id) => api.get(`/pos/${id}/link`),
  linkDetenteur: (id, userId) => api.post(`/pos/${id}/link`, { user_id: Number(userId) }),
  unlinkDetenteur: (id, userId = null) =>
    api.post(`/pos/${id}/unlink`, userId != null && userId !== '' ? { user_id: Number(userId) } : {}),
};

export default posService;
