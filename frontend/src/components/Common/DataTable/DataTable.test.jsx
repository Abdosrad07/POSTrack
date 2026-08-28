import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataTable from './DataTable'

const columns = [
  { key: 'nom', header: 'Nom' },
  { key: 'pos_count', header: 'POS', align: 'right' },
]
const rows = [
  { id: 1, nom: 'Boutique Central', pos_count: 12 },
  { id: 2, nom: 'Kiosque Nord', pos_count: 5 },
]

describe('DataTable', () => {
  it('affiche les colonnes et les lignes', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Boutique Central')).toBeInTheDocument()
    expect(screen.getByText('Kiosque Nord')).toBeInTheDocument()
  })

  it('affiche des squelettes pendant le chargement', () => {
    const { container } = render(<DataTable columns={columns} rows={[]} loading />)
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0)
  })

  it('affiche l’état vide', () => {
    render(<DataTable columns={columns} rows={[]} emptyTitle="Aucun partenaire" />)
    expect(screen.getByText('Aucun partenaire')).toBeInTheDocument()
  })

  it('affiche l’état erreur avec relance', () => {
    const onRetry = vi.fn()
    render(<DataTable columns={columns} rows={[]} error="Échec du chargement" onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('trie les lignes au clic d’en-tête', () => {
    render(<DataTable columns={columns} rows={rows} />)
    fireEvent.click(screen.getByText('POS'))
    const bodyRows = screen.getAllByRole('row')
    expect(bodyRows[1]).toHaveTextContent('Kiosque Nord')
    fireEvent.click(screen.getByText('POS'))
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Boutique Central')
  })

  it('notifie la sélection de lignes', () => {
    const onSelectionChange = vi.fn()
    render(<DataTable columns={columns} rows={rows} selectable selectedKeys={[]} onSelectionChange={onSelectionChange} />)
    fireEvent.click(screen.getByLabelText('Sélectionner la ligne 1'))
    expect(onSelectionChange).toHaveBeenCalledWith([1])
  })

  it('appelle onRowClick au clic d’une ligne', () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} rows={rows} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('Boutique Central'))
    expect(onRowClick).toHaveBeenCalledWith(rows[0])
  })
})
