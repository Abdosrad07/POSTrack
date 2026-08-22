import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import SelectPartnerPage from './SelectPartnerPage';
import { AuthContext } from '../../context/AuthContext';
import { PartnerContext } from '../../context/PartnerContext';

vi.mock('../../services/partnerContextService', () => ({
  partnerContextService: { getAvailable: vi.fn() },
}));

import { partnerContextService } from '../../services/partnerContextService';

const authValue = {
  user: { id: 1, nom_complet: 'Test User', role: 'ADMIN' },
  logout: vi.fn(),
  loading: false,
  isAuthenticated: true,
  token: 'token',
};

const unauthenticatedValue = {
  user: null,
  logout: vi.fn(),
  loading: false,
  isAuthenticated: false,
  token: null,
};

const partnerValue = {
  partner: null,
  partnerContextId: null,
  hasPartner: false,
  setPartner: vi.fn(),
  clearPartner: vi.fn(),
};

describe('SelectPartnerPage', () => {
  it("affiche le bandeau « Données de démo » quand les partenaires sont mockés", async () => {
    partnerContextService.getAvailable.mockResolvedValue([
      { id: 1, nom: 'Partenaire Démo', code_partenaire: 'PD-01', __mock: true },
    ]);

    render(
      <AuthContext.Provider value={authValue}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter>
            <SelectPartnerPage />
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Données de démo')).toBeInTheDocument();
    expect(screen.getByText('Partenaire Démo')).toBeInTheDocument();
  });

  it("n'affiche pas le bandeau quand les partenaires viennent du backend", async () => {
    partnerContextService.getAvailable.mockResolvedValue([
      { id: 2, nom: 'Master Color', code_partenaire: 'PART-MC' },
    ]);

    render(
      <AuthContext.Provider value={authValue}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter>
            <SelectPartnerPage />
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('Master Color')).toBeInTheDocument();
    expect(screen.queryByText('Données de démo')).not.toBeInTheDocument();
  });

  it("redirige vers /login sans session valide et n'appelle pas l'API", async () => {
    partnerContextService.getAvailable.mockClear();

    render(
      <AuthContext.Provider value={unauthenticatedValue}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter initialEntries={['/select-partner']}>
            <Routes>
              <Route path="/login" element={<div>page login</div>} />
              <Route path="/select-partner" element={<SelectPartnerPage />} />
            </Routes>
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    );

    expect(await screen.findByText('page login')).toBeInTheDocument();
    expect(partnerContextService.getAvailable).not.toHaveBeenCalled();
  });
});