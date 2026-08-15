import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { STORAGE_KEYS } from './utils/constants'

vi.mock('./services/authService', async () => {
  const actual = await vi.importActual('./services/authService')
  return {
    ...actual,
    authService: {
      ...actual.authService,
      getCurrentUser: vi.fn(async () => {
        const raw = localStorage.getItem(STORAGE_KEYS.USER)
        return raw ? JSON.parse(raw) : {}
      }),
      logout: vi.fn(async () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)
        localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT)
      }),
    },
  }
})

vi.mock('./services/partnerContextService', () => ({
  partnerContextService: {
    getAvailable: vi.fn(async () => [
      {
        id: 1,
        code_partenaire: 'PART-MC',
        nom: 'Master Color',
        statut: 'ACTIF',
      },
      {
        id: 2,
        code_partenaire: 'PART-GL',
        nom: 'Glothelo',
        statut: 'ACTIF',
      },
    ]),
  },
}))

vi.mock('./services/api', () => {
  const get = vi.fn(async (url) => {
    if (String(url).includes('partenaires')) return { data: [] }
    if (String(url).includes('pos')) {
      return { data: { data: [], pagination: { page: 1, pages: 1, total: 0 } } }
    }
    if (String(url).includes('dsm')) return { data: [] }
    return { data: [] }
  })
  return {
    applyPartnerPrefix: (url, partnerId) =>
      partnerId ? `/partners/${partnerId}${url.startsWith('/') ? url : `/${url}`}` : url,
    default: {
      get,
      post: vi.fn(async () => ({ data: {} })),
      put: vi.fn(async () => ({ data: {} })),
      patch: vi.fn(async () => ({ data: {} })),
      delete: vi.fn(async () => ({ data: {} })),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  }
})

vi.mock('./services/partenaireService', () => ({
  default: {
    getAll: vi.fn(async () => ({ data: [] })),
  },
  partenaireService: {
    getAll: vi.fn(async () => ({ data: [] })),
  },
}))

vi.mock('./services/posService', () => ({
  default: {
    getAll: vi.fn(async () => ({
      data: { data: [], pagination: { page: 1, pages: 1, total: 0 } },
    })),
  },
}))

vi.mock('./services/dsmService', () => ({
  default: {
    getAll: vi.fn(async () => ({ data: [] })),
  },
}))

vi.mock('./services/analyticsService', () => ({
  default: {
    getDashboard: vi.fn(async () => ({
      data: {
        total_pos: 0,
        pos_actifs: 0,
        total_partenaires: 0,
        total_dsm: 0,
        total_bts: 0,
        total_primes: 0,
        total_clients: 0,
      },
    })),
  },
}))

const mockUser = {
  id: 1,
  email: 'admin@postrack.local',
  nom_complet: 'Admin Demo',
  role: 'ADMIN',
  actif: true,
}

const mockPartner = {
  id: 1,
  code_partenaire: 'PART-MC',
  nom: 'Master Color',
  statut: 'ACTIF',
}

function renderApp(initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('App — Module A1', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'mock-token-admin')
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'mock-refresh-admin')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT_ID, String(mockPartner.id))
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT, JSON.stringify(mockPartner))
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('affiche le Dashboard lorsque JWT + PartnerContext sont présents', async () => {
    renderApp(['/'])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
  })

  it('affiche la liste des POS', async () => {
    renderApp(['/pos'])
    await waitFor(() => {
      expect(screen.getByText('Liste des POS')).toBeInTheDocument()
    })
  })

  it('affiche la liste des Partenaires', async () => {
    renderApp(['/partenaires'])
    await waitFor(() => {
      expect(screen.getByText('Liste des Partenaires')).toBeInTheDocument()
    })
  })

  it('redirige vers /select-partner si le PartnerContext est absent', async () => {
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT)
    renderApp(['/'])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sélection du partenaire' })).toBeInTheDocument()
    })
  })
})
