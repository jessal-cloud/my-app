import { useEffect, useState } from 'react'

const HASH_KEY = 'little-steps-passcode-hash'
const COOKIE_NAME = 'little-steps-unlocked'

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hasUnlockCookie() {
  return document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE_NAME}=`))
}

function setUnlockCookie() {
  // No expiry set — this is a session cookie: shared across every tab of this
  // browser (unlike sessionStorage, which is tab-scoped), but cleared when the
  // browser itself fully closes (unlike localStorage, which persists forever).
  document.cookie = `${COOKIE_NAME}=1; path=${import.meta.env.BASE_URL}; SameSite=Lax`
}

function PasscodeGate({ children }) {
  const [checking, setChecking] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [storedHash, setStoredHash] = useState(null)
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const hash = localStorage.getItem(HASH_KEY)
    setStoredHash(hash)
    if (hash && hasUnlockCookie()) {
      setUnlocked(true)
    }
    setChecking(false)
  }, [])

  async function handleSetup(e) {
    e.preventDefault()
    if (value.trim().length < 4) {
      setError('Choose a passcode of at least 4 characters.')
      return
    }
    if (value !== confirmValue) {
      setError("Passcodes don't match.")
      return
    }
    setError('')
    const hash = await sha256Hex(value)
    localStorage.setItem(HASH_KEY, hash)
    setUnlockCookie()
    setUnlocked(true)
  }

  async function handleUnlock(e) {
    e.preventDefault()
    const hash = await sha256Hex(value)
    if (hash === storedHash) {
      setError('')
      setUnlockCookie()
      setUnlocked(true)
    } else {
      setError('Incorrect passcode. Try again.')
      setValue('')
    }
  }

  function handleForgot() {
    if (
      window.confirm(
        "Reset your passcode? Your baby profiles, photos and growth entries won't be deleted — you'll just set a new passcode.",
      )
    ) {
      localStorage.removeItem(HASH_KEY)
      setStoredHash(null)
      setValue('')
      setConfirmValue('')
      setError('')
    }
  }

  if (checking) return null
  if (unlocked) return <>{children}</>

  const isSetup = !storedHash

  return (
    <div className="home-screen">
      <div className="home-card">
        <div className="home-blob" aria-hidden="true" />
        <h1 className="home-title">{isSetup ? 'Set a passcode' : 'Enter your passcode'}</h1>
        <p className="home-subtitle">
          {isSetup
            ? 'Choose a passcode to keep Little Steps private on this device.'
            : 'Enter the passcode you set for Little Steps.'}
        </p>

        <form className="home-form" onSubmit={isSetup ? handleSetup : handleUnlock}>
          <label className="field">
            <span>{isSetup ? 'Choose a passcode' : 'Passcode'}</span>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </label>

          {isSetup && (
            <label className="field">
              <span>Confirm passcode</span>
              <input
                type="password"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                autoComplete="off"
              />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button">
            {isSetup ? 'Set passcode & continue' : 'Unlock'}
          </button>

          {!isSetup && (
            <button type="button" className="text-button" onClick={handleForgot}>
              Forgot your passcode?
            </button>
          )}
        </form>

        <p className="passcode-note">
          🔒 This is a simple privacy screen for shared devices — it isn't secure encryption and
          won't stop someone determined to access this device's storage.
        </p>
      </div>
    </div>
  )
}

export default PasscodeGate
