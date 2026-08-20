const HASH_KEY = 'little-steps-passcode-hash'
const UNLOCK_KEY = 'little-steps-unlocked'

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function getPasscodeHash() {
  return localStorage.getItem(HASH_KEY)
}

export function setPasscodeHash(hash) {
  localStorage.setItem(HASH_KEY, hash)
}

export function clearPasscodeHash() {
  localStorage.removeItem(HASH_KEY)
}

// sessionStorage is scoped to this exact tab and is destroyed the moment the
// tab (or the whole browser) closes — unlike a session cookie, it can't be
// kept alive by the browser continuing to run in the background after every
// window is closed, which is what let the old cookie-based version stay
// "unlocked" across a real browser restart.
export function isUnlocked() {
  return sessionStorage.getItem(UNLOCK_KEY) === '1'
}

export function markUnlocked() {
  sessionStorage.setItem(UNLOCK_KEY, '1')
}

export function lockApp() {
  sessionStorage.removeItem(UNLOCK_KEY)
  window.location.reload()
}
