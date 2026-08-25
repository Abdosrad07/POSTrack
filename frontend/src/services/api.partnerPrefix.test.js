import { describe, expect, it } from 'vitest'
import { applyPartnerPrefix } from '../services/api'

describe('applyPartnerPrefix', () => {
  it('préfixe une route métier avec /partners/{id} (relatif à la racine API)', () => {
    expect(applyPartnerPrefix('/pos', 3)).toBe('/partners/3/pos')
    expect(applyPartnerPrefix('bts', 7)).toBe('/partners/7/bts')
  })

  it('ne double pas le préfixe', () => {
    expect(applyPartnerPrefix('/partners/3/pos', 3)).toBe('/partners/3/pos')
    expect(applyPartnerPrefix('/api/partners/3/pos', 3)).toBe('/partners/3/pos')
  })

  it('laisse les URLs absolues intactes', () => {
    expect(applyPartnerPrefix('http://localhost:8000/api/pos', 1)).toBe(
      'http://localhost:8000/api/pos'
    )
  })

  it('retourne l’URL si partnerId manquant', () => {
    expect(applyPartnerPrefix('/pos', null)).toBe('/pos')
  })

  it('scoping partenaire de chaque module métier (contrat étape 3)', () => {
    // Toute donnée affichée (POS, DSM, BTS, requêtes, SIM, primes) doit
    // transiter par /partners/{partner_id}/... : aucune liste globale.
    expect(applyPartnerPrefix('/pos', 3)).toBe('/partners/3/pos')
    expect(applyPartnerPrefix('/pos/12', 3)).toBe('/partners/3/pos/12')
    expect(applyPartnerPrefix('/dsm', 3)).toBe('/partners/3/dsm')
    expect(applyPartnerPrefix('/bts', 3)).toBe('/partners/3/bts')
    expect(applyPartnerPrefix('/requests', 3)).toBe('/partners/3/requests')
    expect(applyPartnerPrefix('/sim', 3)).toBe('/partners/3/sim')
    expect(applyPartnerPrefix('/primes', 3)).toBe('/partners/3/primes')
    expect(applyPartnerPrefix('/analytics/dashboard', 3)).toBe('/partners/3/analytics/dashboard')
  })

  it('laisse les routes déjà scopées intactes (pas de double préfixe)', () => {
    expect(applyPartnerPrefix('/partners/3/pos', 3)).toBe('/partners/3/pos')
    expect(applyPartnerPrefix('/partners/3/bts', 5)).toBe('/partners/3/bts')
  })
})
