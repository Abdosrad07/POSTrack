import api from './api';

export const analyticsService = {
  getDashboard: (partnerId, dsmId) => api.get(`/partners/${partnerId}/analytics/dashboard`, { params: dsmId ? { dsm_id: dsmId } : {}, skipPartnerPrefix: true }),
  getSalesSummary: (partnerId) => api.get(`/partners/${partnerId}/analytics/sales-summary`, { skipPartnerPrefix: true }),
  listSalesTargets: (partnerId) => api.get(`/partners/${partnerId}/analytics/sales-targets`, { skipPartnerPrefix: true }),
  upsertSalesTarget: (partnerId, payload) => api.post(`/partners/${partnerId}/analytics/sales-targets`, payload, { skipPartnerPrefix: true }),
  getLoadingSummary: (partnerId, params) => api.get(`/partners/${partnerId}/analytics/loading-summary`, { params, skipPartnerPrefix: true }),
};

export default analyticsService;
