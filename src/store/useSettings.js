const KEY = 'quest-life-settings'
const DEFAULTS = { theme: 'dark' }

export function getSettings() {
  try {
    const s = localStorage.getItem(KEY)
    return s ? { ...DEFAULTS, ...JSON.parse(s) } : { ...DEFAULTS }
  } catch { return { ...DEFAULTS } }
}

export function updateSettings(updates) {
  const current = getSettings()
  const next = { ...current, ...updates }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  return next
}

export function applyTheme(theme) {
  document.documentElement.classList.remove('light', 'dark')
  if (theme === 'light') document.documentElement.classList.add('light')
}
