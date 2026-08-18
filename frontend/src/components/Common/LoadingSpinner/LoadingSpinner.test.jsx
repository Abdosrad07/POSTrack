import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner — Module A2', () => {
  it("affiche le libellé 'Chargement...' par défaut avec un rôle status", () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('affiche un libellé personnalisé', () => {
    render(<LoadingSpinner label="Chargement des POS..." />)
    expect(screen.getByText('Chargement des POS...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName('Chargement des POS...')
  })

  it('rend en plein écran avec le mode fullScreen', () => {
    const { container } = render(<LoadingSpinner fullScreen label="Vérification..." />)
    expect(container.firstChild).toHaveClass('min-h-screen')
    expect(screen.getByText('Vérification...')).toBeInTheDocument()
  })

  it('n’affiche pas de texte si label est vide', () => {
    const { container } = render(<LoadingSpinner label="" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})