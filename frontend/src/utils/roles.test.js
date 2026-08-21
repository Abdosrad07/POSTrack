import { describe, expect, it } from 'vitest'
import { ROLES } from './constants'
import { filterNavByRole, getRoleLabel, hasRole, normalizeRole } from './roles'
import { NAV_ITEMS } from './constants'

describe('roles — matrice A2', () => {
  it('normalise les alias backend vers les rôles R7', () => {
    expect(normalizeRole('MANAGER')).toBe(ROLES.REPRESENTANT_PARTENAIRE)
    expect(normalizeRole('DSM')).toBe(ROLES.REPRESENTANT_DSM)
    expect(normalizeRole('VIEWER')).toBe(ROLES.DETENTEUR_POS)
    expect(normalizeRole('ADMIN')).toBe(ROLES.ADMIN)
  })

  it('hasRole accepte les alias et les rôles R7', () => {
    expect(hasRole({ role: 'MANAGER' }, [ROLES.REPRESENTANT_PARTENAIRE])).toBe(true)
    expect(hasRole({ role: 'VIEWER' }, [ROLES.ADMIN])).toBe(false)
    expect(hasRole({ role: 'ADMIN' }, ROLES.ADMIN ? [ROLES.ADMIN] : [])).toBe(true)
  })

  it('fournit un libellé métier', () => {
    expect(getRoleLabel('DSM')).toBe('Représentant DSM')
    expect(getRoleLabel('ADMIN')).toBe('Administrateur')
  })

  it('filtre la navigation : ADMIN voit Partenaires et Audit', () => {
    const items = filterNavByRole(NAV_ITEMS, { role: 'ADMIN' })
    const ids = items.map((i) => i.id)
    expect(ids).toContain('partenaires')
    expect(ids).toContain('audit')
    expect(ids).toContain('import-export')
  })

  it('filtre la navigation : Détenteur POS n’a pas DSM / Primes / Import', () => {
    const items = filterNavByRole(NAV_ITEMS, { role: 'VIEWER' })
    const ids = items.map((i) => i.id)
    expect(ids).toContain('dashboard')
    expect(ids).toContain('pos')
    expect(ids).not.toContain('dsm')
    expect(ids).not.toContain('primes')
    expect(ids).not.toContain('import-export')
    expect(ids).not.toContain('partenaires')
  })

  it('filtre la navigation : Représentant DSM voit POS et Requêtes, pas Import', () => {
    const items = filterNavByRole(NAV_ITEMS, { role: 'DSM' })
    const ids = items.map((i) => i.id)
    expect(ids).toContain('pos')
    expect(ids).toContain('requetes')
    expect(ids).toContain('bts')
    expect(ids).not.toContain('import-export')
    expect(ids).not.toContain('partenaires')
  })
})
