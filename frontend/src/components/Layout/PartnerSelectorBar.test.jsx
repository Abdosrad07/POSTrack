import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import PartnerSelectorBar from './PartnerSelectorBar'
import { PartnerContext } from '../../context/PartnerContext'

describe('PartnerSelectorBar', () => {
  it('affiche le partenaire actif et le bouton de changement', () => {
    render(
      <PartnerContext.Provider
        value={{
          partnerContextId: 1,
          partner: {
            id: 1,
            nom: 'Master Color',
            code_partenaire: 'PART-MC',
            ville: 'Douala',
          },
          hasPartner: true,
          setPartner: vi.fn(),
          clearPartner: vi.fn(),
        }}
      >
        <MemoryRouter>
          <PartnerSelectorBar />
        </MemoryRouter>
      </PartnerContext.Provider>
    )

    expect(screen.getByText('Master Color')).toBeInTheDocument()
    expect(screen.getByText('Changer de partenaire')).toBeInTheDocument()
  })

  it('ne rend rien sans partenaire', () => {
    const { container } = render(
      <PartnerContext.Provider
        value={{
          partnerContextId: null,
          partner: null,
          hasPartner: false,
          setPartner: vi.fn(),
          clearPartner: vi.fn(),
        }}
      >
        <MemoryRouter>
          <PartnerSelectorBar />
        </MemoryRouter>
      </PartnerContext.Provider>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("affiche le bandeau « Données de démo » quand le partenaire porte __mock", () => {
    render(
      <PartnerContext.Provider
        value={{
          partnerContextId: 1,
          partner: {
            id: 1,
            nom: 'Mock Co',
            code_partenaire: 'PART-DEMO',
            __mock: true,
          },
          hasPartner: true,
          setPartner: vi.fn(),
          clearPartner: vi.fn(),
        }}
      >
        <MemoryRouter>
          <PartnerSelectorBar />
        </MemoryRouter>
      </PartnerContext.Provider>
    )

    expect(screen.getByText('Mock Co')).toBeInTheDocument()
    expect(screen.getByText('Données de démo')).toBeInTheDocument()
  })

  it("n'affiche pas le bandeau pour un partenaire réel (sans __mock)", () => {
    render(
      <PartnerContext.Provider
        value={{
          partnerContextId: 1,
          partner: {
            id: 1,
            nom: 'Master Color',
            code_partenaire: 'PART-MC',
          },
          hasPartner: true,
          setPartner: vi.fn(),
          clearPartner: vi.fn(),
        }}
      >
        <MemoryRouter>
          <PartnerSelectorBar />
        </MemoryRouter>
      </PartnerContext.Provider>
    )

    expect(screen.queryByText('Données de démo')).not.toBeInTheDocument()
  })
})
