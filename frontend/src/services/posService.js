
import api from './api';

export const posService = {
  getAll: (params) => api.get('/api/pos', { params }),
  getById: (id) => api.get(`/api/pos/${id}`),
  create: (data) => api.post('/api/pos', data),
  update: (id, data) => api.put(`/api/pos/${id}`, data),
  remove: (id) => api.delete(`/api/pos/${id}`),

  changeStatus: (id, statut) => api.patch(`/api/pos/${id}/status`, { statut }),
};

export default posService;
