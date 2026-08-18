
import api from './api';

export const posService = {
  getAll: (params) => api.get('/pos', { params }),
  getById: (id) => api.get(`/pos/${id}`),
  create: (data) => api.post('/pos', data),
  update: (id, data) => api.put(`/pos/${id}`, data),
  remove: (id) => api.delete(`/pos/${id}`),

  changeStatus: (id, statut) => api.patch(`/pos/${id}/status`, { statut }),
};

export default posService;
