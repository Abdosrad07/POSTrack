import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizeDsm = (dsm) => ({
  ...dsm,
  id: dsm?.id,
  name: dsm?.name ?? dsm?.nom ?? dsm?.full_name ?? '',
  nom: dsm?.nom ?? dsm?.full_name ?? dsm?.name ?? '',
  full_name: dsm?.full_name ?? dsm?.nom ?? dsm?.name ?? '',
  region: dsm?.region ?? dsm?.zone ?? '',
  zone: dsm?.zone ?? dsm?.region ?? '',
  micro_zone: dsm?.micro_zone ?? dsm?.zone ?? '',
  partner_name: dsm?.partner_name ?? dsm?.partner?.name ?? '',
  nb_pos_crees: dsm?.nb_pos_crees ?? dsm?.pos_count ?? 0,
});

export const dsmService = {
  getAll: async (params) => {
    const response = await api.get('/dsm', { params });
    const list = normalizeList(response.data).map(normalizeDsm);
    return { ...response, data: { ...(response.data || {}), items: list } };
  },
  getById: async (id) => {
    const response = await api.get(`/dsm/${id}`);
    const data = response.data ? normalizeDsm(response.data) : response.data;
    return { ...response, data };
  },
  getIdentity: async (id) => {
    const response = await api.get(`/dsm/identity/${id}`);
    const data = response.data ? normalizeDsm(response.data) : response.data;
    return { ...response, data };
  },
  getDashboard: async () => {
    const response = await api.get('/dsm/dashboard');
    return response;
  },
  getDSMDashboard: async (dsmId) => {
    const response = await api.get(`/dsm/${dsmId}/dashboard`);
    return response;
  },
};

export default dsmService;
