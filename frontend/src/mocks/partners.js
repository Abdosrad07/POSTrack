/** Partenaires mock pour la sélection de contexte (hors-ligne / démo) */
export const mockPartners = [
  {
    id: 1,
    code_partenaire: 'PART-MC',
    nom: 'Master Color',
    type_partenaire: 'DISTRIBUTEUR',
    region: 'Littoral',
    ville: 'Douala',
    statut: 'ACTIF',
  },
  {
    id: 2,
    code_partenaire: 'PART-GL',
    nom: 'Glothelo',
    type_partenaire: 'DISTRIBUTEUR',
    region: 'Centre',
    ville: 'Yaoundé',
    statut: 'ACTIF',
  },
  {
    id: 3,
    code_partenaire: 'PART-NW',
    nom: 'NordWest Mobile',
    type_partenaire: 'REVENDEUR',
    region: 'Nord-Ouest',
    ville: 'Bamenda',
    statut: 'ACTIF',
  },
];

/**
 * Filtre les partenaires autorisés selon le rôle (simulation métier).
 * Un Représentant Partenaire / VIEWER n'a typiquement qu'un seul partenaire.
 */
export function getMockPartnersForRole(role) {
  if (role === 'MANAGER' || role === 'REPRESENTANT_PARTENAIRE' || role === 'VIEWER' || role === 'DETENTEUR_POS') {
    return [mockPartners[0]];
  }
  if (role === 'DSM' || role === 'REPRESENTANT_DSM') {
    return mockPartners.slice(0, 2);
  }
  return mockPartners;
}

export default mockPartners;
