import api from './api';

export const dsmService = {
  getAll: (params) => api.get('/dsm', { params }),
};

export default dsmService;
