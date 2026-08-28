import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { NavLevelProvider, detectLevelFromPath } from './NavLevelContext'
import useNavigationLevel from '../hooks/useNavigationLevel'
import Sidebar from '../components/Layout/Sidebar'
import { AuthContext } from '../context/AuthContext'
import { PartnerContext } from '../context/PartnerContext'
import { NAV_LEVELS, STORAGE_KEYS } from '../utils/constants'

const authValue = {
  isAuthenticated: true,
  user: { id: 1, role: 'ADMIN', nom_complet: 'Admin Demo' },
  logout: vi.fn(async () => {}),
}

const partnerValue = {
  partner: null,
  clearPartner: vi.fn(),
}

/** Sonde affichant le niveau courant + actions de navigation. */
function LevelFlow() {
  const { level, setLevel } = useNavigationLevel()
  const navigate = useNavigate()
  return (
    <div>
      <span data-testid="level">{level}</span>
      <button type="button" onClick={() => setLevel(NAV_LEVELS.DSM)}>
        entrer-dsm
      </button>
      <button type="button" onClick={() => navigate('/pos')}>
        aller-pos
      </button>
      <button type="button" onClick={() => setLevel(NAV_LEVELS.PARTNER)}>
        retour-partner
      </button>
    </div>
  )
}

function renderFlow() {
  return render(
    <AuthContext.Provider value={authValue}>
      <PartnerContext.Provider value={partnerValue}>
        <MemoryRouter initialEntries={['/dsm']}>
          <NavLevelProvider>
            <Routes>
              <Route path="*" element={<LevelFlow />} />
            </Routes>
          </NavLevelProvider>
        </MemoryRouter>
      </PartnerContext.Provider>
    </AuthContext.Provider>
  )
}

describe('detectLevelFromPath', () => {
  it('détecte le niveau depuis l’URL', () => {
    expect(detectLevelFromPath('/dsm')).toBe(NAV_LEVELS.DSM)
    expect(detectLevelFromPath('/dsm/3')).toBe(NAV_LEVELS.DSM)
    expect(detectLevelFromPath('/pos')).toBe(NAV_LEVELS.POS)
    expect(detectLevelFromPath('/pos/12')).toBe(NAV_LEVELS.POS)
    expect(detectLevelFromPath('/')).toBe(NAV_LEVELS.PARTNER)
    expect(detectLevelFromPath('/ventes')).toBe(NAV_LEVELS.PARTNER)
  })
})

describe('NavLevelProvider — niveau persistant', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('niveau Partenaire par défaut', () => {
    renderFlow()
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.PARTNER)
  })

  it('reste au niveau DSM pendant les navigations suivantes (sticky)', () => {
    renderFlow()
    // Entrée explicite dans la navigation DSM.
    fireEvent.click(screen.getByRole('button', { name: 'entrer-dsm' }))
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.DSM)
    expect(localStorage.getItem(STORAGE_KEYS.NAV_LEVEL)).toBe(NAV_LEVELS.DSM)

    // Navigation sur une route partagée (/pos) : on reste en niveau DSM.
    fireEvent.click(screen.getByRole('button', { name: 'aller-pos' }))
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.DSM)

    // Retour explicite : on repasse au niveau Partenaire.
    fireEvent.click(screen.getByRole('button', { name: 'retour-partner' }))
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.PARTNER)
    expect(localStorage.getItem(STORAGE_KEYS.NAV_LEVEL)).toBe(NAV_LEVELS.PARTNER)
  })

  it('survit au rechargement de la page (persistance localStorage)', () => {
    localStorage.setItem(STORAGE_KEYS.NAV_LEVEL, NAV_LEVELS.DSM)
    renderFlow()
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.DSM)
  })

  it('revient au niveau Partenaire quand la session est absente', () => {
    localStorage.setItem(STORAGE_KEYS.NAV_LEVEL, NAV_LEVELS.DSM)
    render(
      <AuthContext.Provider value={{ ...authValue, isAuthenticated: false }}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter>
            <NavLevelProvider>
              <LevelFlow />
            </NavLevelProvider>
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    )
    expect(screen.getByTestId('level')).toHaveTextContent(NAV_LEVELS.PARTNER)
    expect(localStorage.getItem(STORAGE_KEYS.NAV_LEVEL)).toBeNull()
  })
})

describe('Sidebar — bouton de retour au niveau Partenaire', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function renderSidebarAtDsm(onClose) {
    localStorage.setItem(STORAGE_KEYS.NAV_LEVEL, NAV_LEVELS.DSM)
    return render(
      <AuthContext.Provider value={authValue}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter initialEntries={['/']}>
            <NavLevelProvider>
              <Routes>
                <Route path="/dashboard" element={<div>Dashboard partenaire</div>} />
                <Route path="*" element={<Sidebar open onClose={onClose} />} />
              </Routes>
            </NavLevelProvider>
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    )
  }

  it('affiche la navigation DSM et le bouton de retour quand le niveau est DSM', () => {
    renderSidebarAtDsm(vi.fn())
    expect(screen.getByRole('link', { name: 'Tableau de bord DSM' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Retour au niveau Partenaire/ })
    ).toBeInTheDocument()
  })

  it('ramène au niveau Partenaire et vers /dashboard au clic sur le retour', () => {
    const onClose = vi.fn()
    renderSidebarAtDsm(onClose)

    fireEvent.click(screen.getByRole('button', { name: /Retour au niveau Partenaire/ }))

    expect(screen.getByText('Dashboard partenaire')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEYS.NAV_LEVEL)).toBe(NAV_LEVELS.PARTNER)
    expect(onClose).toHaveBeenCalled()
  })

  it("n'affiche pas de bouton de retour au niveau Partenaire", () => {
    render(
      <AuthContext.Provider value={authValue}>
        <PartnerContext.Provider value={partnerValue}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <NavLevelProvider>
              <Routes>
                <Route path="/dashboard" element={<Sidebar open onClose={vi.fn()} />} />
                <Route path="*" element={<div>Autre page</div>} />
              </Routes>
            </NavLevelProvider>
          </MemoryRouter>
        </PartnerContext.Provider>
      </AuthContext.Provider>
    )
    expect(
      screen.queryByRole('button', { name: /Retour au niveau Partenaire/ })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  })
})