import api from './api';

/** Référentiel partenaires (hors préfixe /partners/{id}/) */
export const partenaireService = {
  getAll: (params) =>
    api.get('/partenaires', { params, skipPartnerPrefix: true }),
};

export default partenaireService;
