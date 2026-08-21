import api from './api';

export const analyticsService = {
  getDashboard: (partnerId, dsmId) => api.get(`/partners/${partnerId}/analytics/dashboard`, { params: dsmId ? { dsm_id: dsmId } : {} }),
};

export default analyticsService;
