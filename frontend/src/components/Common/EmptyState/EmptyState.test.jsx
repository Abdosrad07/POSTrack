import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState — Module A2', () => {
  it("permet un rendu par défaut 'Aucune donnée'", () => {
    render(<EmptyState />)
    expect(screen.getByText('Aucune donnée')).toBeInTheDocument()
    expect(
      screen.getByText('Aucun élément à afficher pour le moment.')
    ).toBeInTheDocument()
  })

  it('affiche les valeurs personnalisées title / message / icon', () => {
    render(<EmptyState title="Aucun POS" message="Aucun point de vente trouvé." icon="📡" />)
    expect(screen.getByText('Aucun POS')).toBeInTheDocument()
    expect(screen.getByText('Aucun point de vente trouvé.')).toBeInTheDocument()
  })

  it('déclenche onAction quand le bouton d’action est cliqué', () => {
    const onAction = vi.fn()
    render(<EmptyState title="Vide" actionLabel="Ajouter" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('n’affiche pas de bouton sans onAction', () => {
    render(<EmptyState title="Vide" actionLabel="Ajouter" />)
    expect(screen.queryByRole('button', { name: 'Ajouter' })).not.toBeInTheDocument()
  })
})