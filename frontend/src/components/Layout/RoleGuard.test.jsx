import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import RoleGuard from './RoleGuard'
import { AuthContext } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

function renderGuard(user, props = {}) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        isAuthenticated: true,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter>
        <RoleGuard roles={[ROLES.ADMIN]} mode={props.mode || 'message'} {...props}>
          <div>Contenu protégé</div>
        </RoleGuard>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('RoleGuard', () => {
  it('affiche le contenu si le rôle est autorisé', () => {
    renderGuard({ role: 'ADMIN' })
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument()
  })

  it('bloque un rôle non autorisé en mode message', () => {
    renderGuard({ role: 'OPERATIONNEL' }, { mode: 'message' })
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument()
    expect(screen.getByText('Accès refusé')).toBeInTheDocument()
  })

  it('accepte MANAGER pour les écrans réservés au portefeuille partenaire', () => {
    render(
      <AuthContext.Provider
        value={{
          user: { role: 'MANAGER' },
          loading: false,
          isAuthenticated: true,
          token: 'tok',
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <MemoryRouter>
          <RoleGuard roles={[ROLES.MANAGER]} mode="message">
            <div>OK Partenaire</div>
          </RoleGuard>
        </MemoryRouter>
      </AuthContext.Provider>
    )
    expect(screen.getByText('OK Partenaire')).toBeInTheDocument()
  })
})
