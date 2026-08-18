const enabledByEnv = String(import.meta.env.VITE_BTS_DEBUG || '').toLowerCase() === 'true'

const isEnabled = () => enabledByEnv || Boolean(window.__BTS_DEBUG__)

const stringify = (value) => {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const btsDebug = {
  enabled: isEnabled,
  log: (...args) => {
    if (isEnabled()) console.log('[BTS]', ...args)
  },
  warn: (...args) => {
    if (isEnabled()) console.warn('[BTS]', ...args)
  },
  error: (...args) => {
    if (isEnabled()) console.error('[BTS]', ...args)
  },
  snapshot: (label, payload) => {
    if (isEnabled()) console.log(`[BTS] ${label}:`, stringify(payload))
  },
}

export default btsDebug