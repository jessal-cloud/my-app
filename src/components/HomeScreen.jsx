import { useState } from 'react'

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function HomeScreen({ onSave, initial }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Please enter your baby's name.")
      return
    }
    if (!birthDate) {
      setError("Please enter your baby's birthdate.")
      return
    }
    if (birthDate > todayStr()) {
      setError('Birthdate cannot be in the future.')
      return
    }
    setError('')
    onSave({ name: trimmedName, birthDate })
  }

  return (
    <div className="home-screen">
      <div className="home-card">
        <div className="home-blob" aria-hidden="true" />
        <h1 className="home-title">Little Steps</h1>
        <p className="home-subtitle">
          Gentle, stage-by-stage guidance for your baby's first 26 months.
        </p>

        <form className="home-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Baby's name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amara"
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span>Baby's birthdate</span>
            <input
              type="date"
              value={birthDate}
              max={todayStr()}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button">
            See {name.trim() ? `${name.trim()}'s` : "my baby's"} stage
          </button>
        </form>
      </div>
    </div>
  )
}

export default HomeScreen
