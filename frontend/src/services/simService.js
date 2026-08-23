import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeSim = (sim) => ({
  ...sim,
  id: sim?.id,
  iccid: sim?.iccid ?? sim?.numero ?? '',
  statut: sim?.statut ?? sim?.status ?? sim?.state ?? '',
  commentaire: sim?.commentaire ?? sim?.comment ?? '',
  pos: sim?.pos ? {
    ...sim.pos,
    code_pos: sim.pos.code_pos ?? sim.pos.code ?? '',
    nom: sim.pos.nom ?? sim.pos.name ?? '',
  } : sim?.pos,
});

export const simService = {
  getAll: async (params) => {
    const response = await api.get('/sim', { params });
    const list = normalizeList(response.data).map(normalizeSim);
    return { ...response, data: { ...(response.data || {}), items: list } };
  },
  create: (data) => api.post('/sim', data),
  reconduire: (simId, data) => api.post(`/sim/${simId}/reconduction`, data),
  updateStatus: (simId, status) => api.patch(`/sim/${simId}/status`, { status }),
  getMovements: (simId, params) => api.get(`/sim/${simId}/movements`, { params }),
};

export default simService;
