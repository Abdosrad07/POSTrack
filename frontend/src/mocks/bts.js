export const mockBts = [
  {
    id: 1,
    code_bts: 'BTS-DLA-001',
    nom: 'BTS Akwa Centre',
    partenaire: 'Master Color',
    partenaire_id: 1,
    ville: 'Douala',
    region: 'Littoral',
    operateur: 'MTN',
    technologie: '4G',
    capacite_max: 1200,
    dernier_taux_saturation: 42,
    statut: 'ACTIF',
    latitude: 4.0511,
    longitude: 9.7679,
    lieux_couverts: ['Akwa', 'Bonanjo', 'Deido'],
    date_mise_service: '2025-03-01',
  },
  {
    id: 2,
    code_bts: 'BTS-DLA-002',
    nom: 'BTS Bonanjo Port',
    partenaire: 'Master Color',
    partenaire_id: 1,
    ville: 'Douala',
    region: 'Littoral',
    operateur: 'Orange',
    technologie: '4G',
    capacite_max: 900,
    dernier_taux_saturation: 76,
    statut: 'MAINTENANCE',
    latitude: 4.0628,
    longitude: 9.6821,
    lieux_couverts: ['Bonanjo', 'New-Bell', 'Akwa Nord'],
    date_mise_service: '2024-11-15',
  },
  {
    id: 3,
    code_bts: 'BTS-YDE-001',
    nom: 'BTS Centre Ville',
    partenaire: 'Glothelo',
    partenaire_id: 2,
    ville: 'Yaoundé',
    region: 'Centre',
    operateur: 'MTN',
    technologie: '5G',
    capacite_max: 1500,
    dernier_taux_saturation: 89,
    statut: 'ACTIF',
    latitude: 3.848,
    longitude: 11.5021,
    lieux_couverts: ['Centre-ville', 'Essos', 'Mvog-Ada'],
    date_mise_service: '2025-06-20',
  },
]

export function getMockBtsForRole(role) {
  if (role === 'OPERATIONNEL') {
    return [mockBts[0]]
  }
  if (role === 'CHEF_OPERATIONNEL') {
    return mockBts.slice(0, 2)
  }
  return mockBts
}

export default mockBts