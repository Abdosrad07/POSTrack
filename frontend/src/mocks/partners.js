/** Partenaires mock pour la sélection de contexte (hors-ligne / démo).
 * Reflet du référentiel réel (étapes 2-4) : Master Color, Glothelo, Odi, Seven. */
export const mockPartners = [
  {
    id: 2,
    code_partenaire: 'PART-MC',
    nom: 'Master Color',
    type_partenaire: 'DISTRIBUTEUR',
    region: 'Littoral',
    ville: 'Douala',
    statut: 'ACTIF',
    date_debut_contrat: '2025-07-01',
  },
  {
    id: 3,
    code_partenaire: 'PART-GL',
    nom: 'Glothelo',
    type_partenaire: 'DISTRIBUTEUR',
    region: 'Centre',
    ville: 'Yaoundé',
    statut: 'ACTIF',
    date_debut_contrat: '2023-10-23',
  },
  {
    id: 4,
    code_partenaire: 'PART-ODI',
    nom: 'Odi',
    type_partenaire: 'DISTRIBUTEUR',
    ville: null,
    statut: 'ACTIF',
    date_debut_contrat: '2026-09-01',
  },
  {
    id: 5,
    code_partenaire: 'PART-SEV',
    nom: 'Seven',
    type_partenaire: 'DISTRIBUTEUR',
    ville: null,
    statut: 'ACTIF',
    date_debut_contrat: '2026-09-01',
  },
];

/**
 * Filtre les partenaires autorisés selon le rôle (simulation métier).
 * Un OPERATIONNEL n'a typiquement qu'un seul partenaire.
 */
export function getMockPartnersForRole(role) {
  if (role === 'MANAGER' || role === 'CHEF_OPERATIONNEL' || role === 'PARTENAIRE') {
    return [mockPartners[0]];
  }
  if (role === 'OPERATIONNEL') {
    return mockPartners.slice(0, 2);
  }
  return mockPartners;
}

export default mockPartners;
