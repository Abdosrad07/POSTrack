import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorState from './ErrorState'

describe('ErrorState — Module A2', () => {
  it('affiche le message d’erreur par défaut', () => {
    render(<ErrorState />)
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    expect(
      screen.getByText('Impossible de charger les données. Veuillez réessayer.')
    ).toBeInTheDocument()
  })

  it('affiche le titre et le message personnalisés', () => {
    render(<ErrorState title="API indisponible" message="Le serveur ne répond pas." />)
    expect(screen.getByText('API indisponible')).toBeInTheDocument()
    expect(screen.getByText('Le serveur ne répond pas.')).toBeInTheDocument()
  })

  it('affiche et déclenche le bouton Réessayer si onRetry est fourni', () => {
    const onRetry = vi.fn()
    render(<ErrorState message="Connexion perdue" onRetry={onRetry} />)
    const button = screen.getByRole('button', { name: 'Réessayer' })
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('n’affiche pas de bouton de nouvelle tentative sans onRetry', () => {
    render(<ErrorState message="Connexion perdue" />)
    expect(screen.queryByRole('button', { name: 'Réessayer' })).not.toBeInTheDocument()
  })
})