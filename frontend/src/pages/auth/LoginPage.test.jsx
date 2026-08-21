import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import LoginPage from './LoginPage'
import { AuthContext } from '../../context/AuthContext'
import { PartnerContext } from '../../context/PartnerContext'

describe('LoginPage', () => {
  it('rend le formulaire même si le contexte partenaire est indisponible', () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          isAuthenticated: false,
          token: null,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText('POSTrack')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('rend le formulaire avec un partenaire fourni', () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          isAuthenticated: false,
          token: null,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <PartnerContext.Provider
          value={{
            hasPartner: true,
            partner: { id: 1, nom: 'Partenaire test' },
            setPartner: vi.fn(),
            clearPartner: vi.fn(),
            partnerContextId: 1,
          }}
        >
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    )

    expect(screen.getByText('POSTrack')).toBeInTheDocument()
  })
})