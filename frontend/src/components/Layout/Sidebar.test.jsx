import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'
import { AuthContext } from '../../context/AuthContext'

function renderSidebar(role) {
  return render(
    <AuthContext.Provider
      value={{
        user: { role, nom_complet: 'Test' },
        loading: false,
        isAuthenticated: true,
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter>
        <Sidebar open onClose={vi.fn()} />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Sidebar', () => {
  it('montre Partenaires pour ADMIN', () => {
    renderSidebar('ADMIN')
    expect(screen.getByText('Partenaires')).toBeInTheDocument()
    expect(screen.getByText('Audit')).toBeInTheDocument()
  })

  it('cache DSM et Import pour Operationnel', () => {
    renderSidebar('OPERATIONNEL')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('POS')).toBeInTheDocument()
    expect(screen.queryByText('DSM')).not.toBeInTheDocument()
    expect(screen.queryByText('Import Excel')).not.toBeInTheDocument()
    expect(screen.queryByText('Partenaires')).not.toBeInTheDocument()
  })
})
