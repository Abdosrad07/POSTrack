import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PartnerProvider } from '../context/PartnerContext'
import { AuthContext } from '../context/AuthContext'
import usePartner from '../hooks/usePartner'
import { STORAGE_KEYS } from '../utils/constants'
import { queryClient as appQueryClient } from '../lib/queryClient'

function Probe() {
  const { partnerContextId, partner, hasPartner, setPartner, clearPartner } = usePartner()
  return (
    <div>
      <span data-testid="has-partner">{String(hasPartner)}</span>
      <span data-testid="partner-id">{partnerContextId ?? 'none'}</span>
      <span data-testid="partner-name">{partner?.nom ?? 'none'}</span>
      <button
        type="button"
        onClick={() => setPartner({ id: 2, nom: 'Glothelo', code_partenaire: 'PART-GL' })}
      >
        Select
      </button>
      <button type="button" onClick={() => clearPartner()}>
        Clear
      </button>
    </div>
  )
}

function renderWithAuth(authValue) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={authValue}>
        <PartnerProvider>
          <Probe />
        </PartnerProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

describe('PartnerContext', () => {
  beforeEach(() => {
    localStorage.clear()
    appQueryClient.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persiste partner_context_id et invalide le cache au changement', async () => {
    const clearSpy = vi.spyOn(appQueryClient, 'clear')
    renderWithAuth({
      isAuthenticated: true,
      loading: false,
      user: { role: 'ADMIN' },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
    })

    expect(screen.getByTestId('has-partner')).toHaveTextContent('false')

    await act(async () => {
      screen.getByText('Select').click()
    })

    expect(screen.getByTestId('has-partner')).toHaveTextContent('true')
    expect(screen.getByTestId('partner-id')).toHaveTextContent('2')
    expect(localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)).toBe('2')
    expect(clearSpy).toHaveBeenCalled()
  })

  it('clearPartner retire le contexte', async () => {
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT_ID, '1')
    localStorage.setItem(
      STORAGE_KEYS.PARTNER_CONTEXT,
      JSON.stringify({ id: 1, nom: 'Master Color' })
    )

    renderWithAuth({
      isAuthenticated: true,
      loading: false,
      user: { role: 'ADMIN' },
      token: 'tok',
      login: vi.fn(),
      logout: vi.fn(),
    })

    expect(screen.getByTestId('partner-name')).toHaveTextContent('Master Color')

    await act(async () => {
      screen.getByText('Clear').click()
    })

    expect(screen.getByTestId('has-partner')).toHaveTextContent('false')
    expect(localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)).toBeNull()
  })
})
