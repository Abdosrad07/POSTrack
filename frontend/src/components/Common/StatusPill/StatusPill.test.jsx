import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusPill from './StatusPill'

describe('StatusPill', () => {
  it('affiche le libellé de statut', () => {
    render(<StatusPill status="Actif" />)
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('détecte la couleur sémantique des statuts métier courants', () => {
    render(<StatusPill status="actif" />)
    const pill = screen.getByText('actif')
    expect(pill.className).toContain('badge-success')
    expect(pill.className).toContain('badge-dot')
  })

  it('respecte la couleur explicite fournie', () => {
    render(<StatusPill status="actif" color="danger" />)
    expect(screen.getByText('actif').className).toContain('badge-danger')
  })

  it('retombe sur neutre pour un statut inconnu', () => {
    render(<StatusPill status="statut-inconnu-xyz" />)
    expect(screen.getByText('statut-inconnu-xyz').className).toContain('badge-gray')
  })

  it('peut masquer le point de statut', () => {
    render(<StatusPill status="actif" dot={false} />)
    expect(screen.getByText('actif').className).not.toContain('badge-dot')
  })
})
