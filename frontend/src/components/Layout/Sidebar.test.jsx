import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'
import { AuthContext } from '../../context/AuthContext'
import { PartnerContext } from '../../context/PartnerContext'

function renderSidebar(role) {
  return render(
    <AuthContext.Provider
      value={{
        user: { role, nom_complet: 'Test' },
        loading: false,
        isAuthenticated: true,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(async () => {}),
      }}
    >
      <PartnerContext.Provider
        value={{
          partner: null,
          partnerContextId: null,
          setPartner: vi.fn(),
          clearPartner: vi.fn(),
          hasPartner: false,
        }}
      >
        <MemoryRouter>
          <Sidebar open onClose={vi.fn()} />
        </MemoryRouter>
      </PartnerContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Sidebar', () => {
  it('montre Partenaires pour ADMIN', () => {
    renderSidebar('ADMIN')
    expect(screen.getByRole('link', { name: 'Partenaires' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Audit' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Accès refusé' })).not.toBeInTheDocument()
  })

  it('cache DSM et Import pour OPERATIONNEL', () => {
    renderSidebar('OPERATIONNEL')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'POS' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'DSM' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Stock SIM' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Partenaires' })).not.toBeInTheDocument()
  })

  it('affiche un bouton de déconnexion dans le menu mobile', () => {
    renderSidebar('ADMIN')
    expect(screen.getByRole('button', { name: 'Déconnexion' })).toBeInTheDocument()
  })
})
