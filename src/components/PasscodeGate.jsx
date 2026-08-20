import { useEffect, useState } from 'react'
import {
  sha256Hex,
  getPasscodeHash,
  setPasscodeHash,
  clearPasscodeHash,
  isUnlocked,
  markUnlocked,
} from '../utils/passcodeLock'

const MIN_PASSCODE_LENGTH = 8

function PasscodeGate({ children }) {
  const [checking, setChecking] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [storedHash, setStoredHash] = useState(null)
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const hash = getPasscodeHash()
    setStoredHash(hash)
    if (hash && isUnlocked()) {
      setUnlocked(true)
    }
    setChecking(false)
  }, [])

  async function handleSetup(e) {
    e.preventDefault()
    if (value.trim().length < MIN_PASSCODE_LENGTH) {
      setError(`Choose a passcode of at least ${MIN_PASSCODE_LENGTH} characters.`)
      return
    }
    if (value !== confirmValue) {
      setError("Passcodes don't match.")
      return
    }
    setError('')
    const hash = await sha256Hex(value)
    setPasscodeHash(hash)
    markUnlocked()
    setUnlocked(true)
  }

  async function handleUnlock(e) {
    e.preventDefault()
    const hash = await sha256Hex(value)
    if (hash === storedHash) {
      setError('')
      markUnlocked()
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
      clearPasscodeHash()
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

        <form className="home-form" onSubmit={isSetup ? handleSetup : handleUnlock} noValidate>
          <label className="field">
            <span>{isSetup ? 'Choose a passcode' : 'Passcode'}</span>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              autoComplete="off"
              minLength={isSetup ? MIN_PASSCODE_LENGTH : undefined}
            />
            {isSetup && <span className="field-hint">Use at least {MIN_PASSCODE_LENGTH} characters.</span>}
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
