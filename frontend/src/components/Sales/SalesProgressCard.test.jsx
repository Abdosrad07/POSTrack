import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SalesProgressCard from './SalesProgressCard'

describe('SalesProgressCard', () => {
  it('affiche les 4 barres et gère les valeurs manquantes', () => {
    render(<SalesProgressCard data={{ creation: { cumul: 10, objectif: 20, progression: 50 }, redeploiement: { cumul: 0, objectif: 0, progression: null }, sell_out: { cumul: 3, objectif: null, progression: null }, loading: { cumul: 5, objectif: 10, progression: 50 } }} />)
    expect(screen.getByText('Progressions par catégorie')).toBeInTheDocument()
    expect(screen.getByText('Création')).toBeInTheDocument()
    expect(screen.getByText('Redéploiement')).toBeInTheDocument()
    expect(screen.getByText('Sell-out')).toBeInTheDocument()
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getAllByText('Non renseigné').length).toBeGreaterThan(0)
  })

  it('affiche les recettes quand elles sont disponibles', () => {
    const dataWithRecettes = {
      creation: { cumul: 10, objectif: 20, progression: 50, stock_initial: 15, recette: 5000000 },
      redeploiement: { cumul: 5, objectif: 10, progression: 50, stock_initial: 8, recette: 2000000 },
      sell_out: { cumul: 3, objectif: null, progression: null, stock_initial: null, recette: 8000000 },
      loading: { cumul: 5, objectif: 10, progression: 50, stock_initial: null, recette: null },
    }
    render(<SalesProgressCard data={dataWithRecettes} />)
    expect(screen.getByText('5 000 000 FCFA')).toBeInTheDocument()
    expect(screen.getByText('2 000 000 FCFA')).toBeInTheDocument()
    expect(screen.getByText('8 000 000 FCFA')).toBeInTheDocument()
  })

  it("n'affiche pas les recettes quand elles sont null", () => {
    const dataWithoutRecettes = {
      creation: { cumul: 10, objectif: 20, progression: 50, stock_initial: 15, recette: null },
      redeploiement: { cumul: 5, objectif: 10, progression: 50, stock_initial: 8, recette: null },
      sell_out: { cumul: 3, objectif: null, progression: null, stock_initial: null, recette: null },
      loading: { cumul: 5, objectif: 10, progression: 50, stock_initial: null, recette: null },
    }
    render(<SalesProgressCard data={dataWithoutRecettes} />)
    expect(screen.queryByText(/FCFA/)).not.toBeInTheDocument()
  })
})