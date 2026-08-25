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
  { id: 2, nom: 'Master Color', code_partenaire: 'PART-MC', dsms: [{ id: 2, nom: 'DSM Master Color', matricule: 'DSM-TMP-MC', pos: [{ id: 201, code_pos: 'POS-MC-000001' }] }] },
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
    expect(screen.getByRole('button', { name: /Hiérarchie/i })).toBeInTheDocument();
    expect(screen.getByText('Tous les partenaires')).toBeInTheDocument();
  });

  it('charge et affiche l arborescence', async () => {
    renderComponent(ROLES.ADMIN);
    fireEvent.click(screen.getByRole('button', { name: /Hiérarchie/i }));

    await waitFor(() => expect(hierarchyService.getHierarchy).toHaveBeenCalledTimes(1));
        expect(await screen.findByText('Navigation réseau')).toBeInTheDocument();
    expect(screen.getByText('Master Color')).toBeInTheDocument();
    expect(screen.getByText('PART-MC')).toBeInTheDocument();
    expect(screen.getByText('DSM Master Color')).toBeInTheDocument();
    expect(screen.getByText(/POS-MC-000001/i)).toBeInTheDocument();
  });

    it('affiche un contexte verrouillé pour OPERATIONNEL', () => {
    renderComponent(ROLES.OPERATIONNEL, { id: 2, nom: 'Master Color' });
    expect(screen.getByText(/verrouillé/i)).toBeInTheDocument();
  });
});