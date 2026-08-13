import api from './api';

export const partenaireService = {
  getAll: (params) => api.get('/partenaires', { params }),
};

export default partenaireService;
