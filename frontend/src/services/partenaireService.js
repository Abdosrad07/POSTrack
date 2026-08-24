import api from './api';

/** Référentiel partenaires (hors préfixe /partners/{id}/) */
export const partenaireService = {
  getAll: (params) =>
    api.get('/partenaires', { params, skipPartnerPrefix: true }),
  getAvailable: (params) =>
    api.get('/auth/partenaires/available', { params, skipPartnerPrefix: true }),
};

export default partenaireService;
