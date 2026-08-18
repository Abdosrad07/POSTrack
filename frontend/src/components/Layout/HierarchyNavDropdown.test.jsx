import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import HierarchyNavDropdown from './HierarchyNavDropdown';
import { hierarchyService } from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { PartnerContext } from '../../context/PartnerContext';
import { ROLES } from '../../utils/constants';

// Mock hierarchy service
vi.mock('../../services/hierarchyService', () => ({
  hierarchyService: {
    getHierarchy: vi.fn(),
  },
}));

const mockHierarchyData = [
  {
    id: 1,
    nom: 'Camtel Express',
    code_partenaire: 'PART-001',
    ville: 'Douala',
    region: 'Littoral',
    statut: 'ACTIF',
    dsms: [
      {
        id: 10,
        nom: 'Jean Marc',
        matricule: 'DSM-DLA-01',
        zone_couverture: 'Douala Akwa',
        statut: 'ACTIF',
        pos: [
          {
            id: 101,
            nom: 'Kiosque Akwa Liberté',
            code_pos: 'POS-DEMO-0001',
            ville: 'Douala',
            type_pos: 'NOUVEAU',
            statut: 'ACTIF',
          },
        ],
      },
    ],
    bts: [
      {
        id: 50,
        nom: 'Antenne Akwa',
        code_bts: 'BTS-DLA-01',
        ville: 'Douala',
        statut: 'ACTIF',
      },
    ],
  },
];

const renderComponent = (userRole = ROLES.ADMIN, partnerVal = null) => {
  const authValue = {
    user: { id: 1, nom_complet: 'Test User', role: userRole },
    logout: vi.fn(),
    isAuthenticated: true,
  };
  const partnerValue = {
    partner: partnerVal,
    partnerContextId: partnerVal?.id || null,
    setPartner: vi.fn(),
    clearPartner: vi.fn(),
    hasPartner: !!partnerVal,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <PartnerContext.Provider value={partnerValue}>
          <HierarchyNavDropdown />
        </PartnerContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('HierarchyNavDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hierarchyService.getHierarchy.mockResolvedValue(mockHierarchyData);
  });

  it('affiche le bouton déclencheur avec le badge de portée Admin', () => {
    renderComponent(ROLES.ADMIN);
    expect(screen.getByText('Hiérarchie')).toBeInTheDocument();
    expect(screen.getByText('Accès Global')).toBeInTheDocument();
  });

  it('affiche le badge Représentant Partenaire avec le nom du partenaire', () => {
    renderComponent(ROLES.REPRESENTANT_PARTENAIRE, { id: 1, nom: 'Camtel Express' });
    expect(screen.getByText('Camtel Express')).toBeInTheDocument();
  });

  it('ouvre le menu déroulant et affiche l arborescence Partenaire -> DSM -> POS -> BTS', async () => {
    renderComponent(ROLES.ADMIN);

    const button = screen.getByRole('button', { name: /Hiérarchie/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(hierarchyService.getHierarchy).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Navigation Réseau')).toBeInTheDocument();
    expect(screen.getByText('Camtel Express')).toBeInTheDocument();
    expect(screen.getByText('PART-001')).toBeInTheDocument();
    expect(screen.getByText('Jean Marc')).toBeInTheDocument();
    expect(screen.getByText('Kiosque Akwa Liberté')).toBeInTheDocument();
    expect(screen.getByText('POS-DEMO-0001')).toBeInTheDocument();
    expect(screen.getByText('Antenne Akwa')).toBeInTheDocument();
    expect(screen.getByText('(BTS-DLA-01)')).toBeInTheDocument();
  });

  it('permet de filtrer en temps réel avec la barre de recherche', async () => {
    renderComponent(ROLES.ADMIN);

    const button = screen.getByRole('button', { name: /Hiérarchie/i });
    fireEvent.click(button);

    await screen.findByText('Camtel Express');

    const searchInput = screen.getByPlaceholderText(/Filtrer/i);
    fireEvent.change(searchInput, { target: { value: 'Inexistant' } });

    expect(screen.getByText(/Aucun résultat pour cette recherche/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Akwa' } });
    expect(screen.getByText('Kiosque Akwa Liberté')).toBeInTheDocument();
  });
});
