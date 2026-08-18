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
})
