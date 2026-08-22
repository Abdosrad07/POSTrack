import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import PartnerRoute from './PartnerRoute';
import { AuthContext } from '../context/AuthContext';
import { PartnerContext } from '../context/PartnerContext';

const renderRoute = ({ isAuthenticated, loading = false, hasPartner }) => {
  const authValue = {
    isAuthenticated,
    loading,
    user: isAuthenticated ? { id: 1, role: 'ADMIN' } : null,
    token: isAuthenticated ? 'token' : null,
    login: vi.fn(),
    logout: vi.fn(),
  };
  const partnerValue = {
    hasPartner,
    partnerContextId: hasPartner ? 1 : null,
    partner: hasPartner ? { id: 1, nom: 'Master Color' } : null,
    setPartner: vi.fn(),
    clearPartner: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <PartnerContext.Provider value={partnerValue}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/login" element={<div>page login</div>} />
            <Route path="/select-partner" element={<div>page sélection partenaire</div>} />
            <Route
              path="/"
              element={
                <PartnerRoute>
                  <div>contenu protégé</div>
                </PartnerRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </PartnerContext.Provider>
    </AuthContext.Provider>
  );
};

describe('PartnerRoute', () => {
  it('redirige vers /login sans session valide', () => {
    renderRoute({ isAuthenticated: false, hasPartner: false });
    expect(screen.getByText('page login')).toBeInTheDocument();
    expect(screen.queryByText('contenu protégé')).not.toBeInTheDocument();
  });

  it('redirige vers /select-partner si connecté mais sans partenaire', () => {
    renderRoute({ isAuthenticated: true, hasPartner: false });
    expect(screen.getByText('page sélection partenaire')).toBeInTheDocument();
  });

  it('affiche le contenu protégé quand connecté avec un partenaire', () => {
    renderRoute({ isAuthenticated: true, hasPartner: true });
    expect(screen.getByText('contenu protégé')).toBeInTheDocument();
  });
});