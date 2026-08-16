import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import Breadcrumb from './Breadcrumb'

describe('Breadcrumb — Module A2', () => {
  it('rend les éléments avec un lien pour le non dernier', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'POS' }]} />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument()
    expect(screen.getByText('POS')).toBeInTheDocument()
  })

  it('rend le dernier élément sans lien même si to est fourni', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Dashboard', to: '/' }]} />
      </MemoryRouter>
    )
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('ne rend rien si la liste est vide', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})