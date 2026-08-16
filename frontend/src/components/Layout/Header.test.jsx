import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'
import { AuthContext } from '../../context/AuthContext'

const authValue = (overrides = {}) => ({
  user: { id: 1, nom_complet: 'Admin Demo', role: 'ADMIN' },
  token: 'tok',
  login: vi.fn(),
  logout: vi.fn(async () => {}),
  isAuthenticated: true,
  loading: false,
  ...overrides,
})

describe('Header — Module A2', () => {
  it("affiche le nom de l'utilisateur, son rôle et le bouton Déconnexion", () => {
    render(
      <AuthContext.Provider value={authValue()}>
        <MemoryRouter>
          <Header onToggleSidebar={vi.fn()} />
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Admin Demo')).toBeInTheDocument()
    expect(screen.getByText('Administrateur')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Déconnexion' })).toBeInTheDocument()
  })

  it('affiche la marque POSTrack', () => {
    render(
      <AuthContext.Provider value={authValue()}>
        <MemoryRouter>
          <Header onToggleSidebar={vi.fn()} />
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('POSTrack')).toBeInTheDocument()
  })

  it('redirige vers /login après la déconnexion', async () => {
    const logout = vi.fn(async () => {})
    render(
      <AuthContext.Provider value={authValue({ logout })}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Header onToggleSidebar={vi.fn()} />} />
            <Route path="/login" element={<div>Page de connexion</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Déconnexion' }))
    expect(logout).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Page de connexion')).toBeInTheDocument()
  })

  it('affiche un libellé de rôle inconnu si le rôle est absent', () => {
    render(
      <AuthContext.Provider value={authValue({ user: { email: 'x@y.z' } })}>
        <MemoryRouter>
          <Header onToggleSidebar={vi.fn()} />
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('Rôle inconnu')).toBeInTheDocument()
  })
})