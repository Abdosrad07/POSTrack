import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchFilterBar from './SearchFilterBar'

describe('SearchFilterBar', () => {
  it('affiche la recherche et notifie la saisie', () => {
    const onSearchChange = vi.fn()
    render(<SearchFilterBar search="" onSearchChange={onSearchChange} searchPlaceholder="Rechercher un partenaire…" />)
    const input = screen.getByLabelText('Rechercher un partenaire…')
    fireEvent.change(input, { target: { value: 'Douala' } })
    expect(onSearchChange).toHaveBeenCalledWith('Douala')
  })

  it('rend les filtres déroulants avec leur libellé', () => {
    render(
      <SearchFilterBar
        filters={[{ key: 'statut', label: 'Statut : tous', value: '', options: [{ value: 'actif', label: 'Actif' }], onChange: () => {} }]}
      />,
    )
    expect(screen.getByLabelText('Statut : tous')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Actif' })).toBeInTheDocument()
  })

  it('affiche les chips de filtres actifs avec suppression', () => {
    const onRemove = vi.fn()
    render(<SearchFilterBar activeFilters={[{ label: 'Statut : actif', onRemove }]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retirer le filtre Statut : actif' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('affiche le compteur de résultats', () => {
    render(<SearchFilterBar resultCount={12} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/résultat/)).toBeInTheDocument()
  })
})
