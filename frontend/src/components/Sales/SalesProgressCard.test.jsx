import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SalesProgressCard from './SalesProgressCard'

describe('SalesProgressCard', () => {
  it('affiche les 4 barres et gère les valeurs manquantes', () => {
    render(<SalesProgressCard data={{ creation: { cumul: 10, objectif: 20, progression: 50 }, redeploiement: { cumul: 0, objectif: 0, progression: null }, sell_out: { cumul: 3, objectif: null, progression: null }, loading: { cumul: 5, objectif: 10, progression: 50 } }} />)
    expect(screen.getByText('Suivi des ventes')).toBeInTheDocument()
    expect(screen.getByText('Création')).toBeInTheDocument()
    expect(screen.getByText('Redéploiement')).toBeInTheDocument()
    expect(screen.getByText('Sell-out')).toBeInTheDocument()
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getAllByText('Non renseigné').length).toBeGreaterThan(0)
  })
})