import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PageHeader from './PageHeader'

describe('PageHeader — Module A2', () => {
  it('affiche le titre et le sous-titre', () => {
    render(<PageHeader title="Liste des POS" subtitle="Parc du partenaire actif." />)
    expect(screen.getByRole('heading', { name: 'Liste des POS' })).toBeInTheDocument()
    expect(screen.getByText('Parc du partenaire actif.')).toBeInTheDocument()
  })

  it('affiche le fil d’ariane fourni', () => {
    render(<PageHeader title="Détails" breadcrumbs={['Espace partenaire', 'POS']} />)
    expect(screen.getByText('Espace partenaire')).toBeInTheDocument()
    expect(screen.getByText('POS')).toBeInTheDocument()
  })

  it('affiche et exécute les actions', () => {
    const onClick = vi.fn()
    render(
      <PageHeader
        title="POS"
        actions={<button type="button" onClick={onClick}>Nouveau POS</button>}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nouveau POS' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ne rend pas les zones optionnelles si absentes', () => {
    render(<PageHeader title="POS" />)
    expect(screen.getByRole('heading', { name: 'POS' })).toBeInTheDocument()
  })
})