import api from './api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const normalizePrime = (prime) => ({
  ...prime,
  id: prime?.id,
  montant: prime?.montant ?? prime?.amount ?? 0,
  date_attribution: prime?.date_attribution ?? prime?.date ?? '',
  statut: prime?.statut ?? prime?.status ?? '',
  pos: prime?.pos ? {
    ...prime.pos,
    nom: prime.pos.nom ?? prime.pos.name ?? '',
    name: prime.pos.name ?? prime.pos.nom ?? '',
    code_pos: prime.pos.code_pos ?? prime.pos.code ?? '',
    partenaire: prime.pos.partenaire ? {
      ...prime.pos.partenaire,
      nom: prime.pos.partenaire.nom ?? prime.pos.partenaire.name ?? '',
      name: prime.pos.partenaire.name ?? prime.pos.partenaire.nom ?? '',
    } : prime.pos.partenaire,
  } : prime?.pos,
  partenaire: prime?.partenaire ? {
    ...prime.partenaire,
    nom: prime.partenaire.nom ?? prime.partenaire.name ?? '',
    name: prime.partenaire.name ?? prime.partenaire.nom ?? '',
  } : prime?.partenaire,
});

export const primeService = {
  getAll: async (params) => {
    const response = await api.get('/primes', { params });
    const list = normalizeList(response.data).map(normalizePrime);
    return { ...response, data: { ...(response.data || {}), items: list } };
  },
};

export default primeService;
