import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { authService } from './authService'
import { STORAGE_KEYS } from '../utils/constants'

describe('authService — JWT Access + Refresh', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('persiste access_token et refresh_token en mode mock hors-ligne', async () => {
    const data = await authService.login({ username: 'admin', password: 'admin123' })

    expect(data.access_token).toBeTruthy()
    expect(data.refresh_token).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe(data.access_token)
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe(data.refresh_token)
    expect(data.user.role).toBe('ADMIN')
  })

  it('refresh mock renouvelle l’access token', async () => {
    await authService.login({ username: 'manager', password: 'manager123' })
    const refreshed = await authService.refresh()
    expect(refreshed.access_token).toContain('mock-token-')
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe(refreshed.access_token)
  })

  it('logout efface tokens, user et partner_context', async () => {
    await authService.login({ username: 'admin', password: 'admin123' })
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT_ID, '1')
    await authService.logout()
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID)).toBeNull()
  })
})
