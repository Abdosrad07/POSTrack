import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import HierarchyNavDropdown from './HierarchyNavDropdown';
import { hierarchyService } from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { PartnerContext } from '../../context/PartnerContext';
import { ROLES } from '../../utils/constants';

vi.mock('../../services/hierarchyService', () => ({
  hierarchyService: { getHierarchy: vi.fn() },
}));

const mockHierarchyData = [
  { id: 1, nom: 'Camtel Express', code_partenaire: 'PART-001', dsms: [{ id: 10, nom: 'Jean Marc', matricule: 'DSM-DLA-01', pos: [{ id: 101, code_pos: 'POS-DEMO-0001' }] }] },
];

const renderComponent = (userRole = ROLES.ADMIN, partnerVal = null) => {
  const authValue = { user: { id: 1, nom_complet: 'Test User', role: userRole }, logout: vi.fn(), isAuthenticated: true };
  const partnerValue = { partner: partnerVal, partnerContextId: partnerVal?.id || null, setPartner: vi.fn(), clearPartner: vi.fn(), hasPartner: !!partnerVal };

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

  it('affiche le résumé de contexte', () => {
    renderComponent(ROLES.ADMIN);
    expect(screen.getByText('Hiérarchie')).toBeInTheDocument();
    expect(screen.getByText('Tous les partenaires')).toBeInTheDocument();
  });

  it('charge et affiche l arborescence', async () => {
    renderComponent(ROLES.ADMIN);
    fireEvent.click(screen.getByRole('button', { name: /Hiérarchie/i }));

    await waitFor(() => expect(hierarchyService.getHierarchy).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Navigation réseau')).toBeInTheDocument();
    expect(screen.getByText('Camtel Express')).toBeInTheDocument();
    expect(screen.getByText('PART-001')).toBeInTheDocument();
    expect(screen.getByText('Jean Marc')).toBeInTheDocument();
    expect(screen.getByText(/POS-DEMO-0001/i)).toBeInTheDocument();
  });

  it('affiche un contexte verrouillé pour OPERATIONNEL', () => {
    renderComponent(ROLES.OPERATIONNEL, { id: 1, nom: 'Camtel Express' });
    expect(screen.getByText(/verrouillé/i)).toBeInTheDocument();
  });
});