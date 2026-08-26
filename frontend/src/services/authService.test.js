import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

vi.mock('./api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import api from './api'
import { authService } from './authService'
import { STORAGE_KEYS } from '../utils/constants'

describe('authService — JWT Access + Refresh (backend réel uniquement)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persiste les tokens et le profil renvoyés par le backend', async () => {
    api.post.mockResolvedValueOnce({
      data: { access_token: 'at-1', refresh_token: 'rt-1', token_type: 'bearer' },
    })
    api.get.mockResolvedValueOnce({ data: { id: 7, role: 'ADMIN', nom_complet: 'Admin Réel' } })

    const data = await authService.login({ username: 'admin', password: 'Pwd@Test1234' })

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      { username: 'admin', password: 'Pwd@Test1234' },
      { skipPartnerPrefix: true }
    )
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('at-1')
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('rt-1')
    expect(data.user.role).toBe('ADMIN')
  })

  it('ne crée AUCUNE session simulée quand le backend est injoignable', async () => {
    api.post.mockRejectedValueOnce({ code: 'ERR_NETWORK' })

    await expect(authService.login({ username: 'admin', password: 'admin123' })).rejects.toEqual({
      code: 'ERR_NETWORK',
    })
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
  })

  it('rafraîchit le jeton via POST /auth/refresh', async () => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'rt-old')
    api.post.mockResolvedValueOnce({
      data: { access_token: 'at-2', refresh_token: 'rt-old', token_type: 'bearer' },
    })

    const refreshed = await authService.refresh()

    expect(api.post).toHaveBeenCalledWith(
      '/auth/refresh',
      { refresh_token: 'rt-old' },
      { skipPartnerPrefix: true }
    )
    expect(refreshed.access_token).toBe('at-2')
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('at-2')
  })

  it('logout efface tokens, user et partner_context', async () => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'at-x')
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'rt-x')
    localStorage.setItem(STORAGE_KEYS.USER, '{"id":1}')
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT_ID, '1')

    await authService.logout()

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)).toBeNull()
  })
})
