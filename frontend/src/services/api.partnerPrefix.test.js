import { describe, expect, it } from 'vitest'
import { applyPartnerPrefix } from '../services/api'

describe('applyPartnerPrefix', () => {
  it('préfixe une route métier avec /partners/{id}', () => {
    expect(applyPartnerPrefix('/pos', 3)).toBe('/partners/3/pos')
    expect(applyPartnerPrefix('bts', 7)).toBe('/partners/7/bts')
  })

  it('ne double pas le préfixe', () => {
    expect(applyPartnerPrefix('/partners/3/pos', 3)).toBe('/partners/3/pos')
  })

  it('laisse les URLs absolues intactes', () => {
    expect(applyPartnerPrefix('http://localhost:8000/api/pos', 1)).toBe(
      'http://localhost:8000/api/pos'
    )
  })

  it('retourne l’URL si partnerId manquant', () => {
    expect(applyPartnerPrefix('/pos', null)).toBe('/pos')
  })
})
