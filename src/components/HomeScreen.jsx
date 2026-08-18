import { useState } from 'react'

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const COPY = {
  welcome: {
    title: 'Little Steps',
    subtitle: "Gentle, stage-by-stage guidance for your baby's first 26 months.",
  },
  add: {
    title: 'Add a child',
    subtitle: "Enter their name and birthdate to see their stage.",
  },
  edit: {
    title: 'Edit details',
    subtitle: "Update your child's name or birthdate.",
  },
}

function HomeScreen({ onSave, onCancel, initial, mode = 'welcome' }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '')
  const [error, setError] = useState('')

  const { title, subtitle } = COPY[mode] ?? COPY.welcome

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
        <h1 className="home-title">{title}</h1>
        <p className="home-subtitle">{subtitle}</p>

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
            {mode === 'edit'
              ? 'Save changes'
              : `See ${name.trim() ? `${name.trim()}'s` : "my baby's"} stage`}
          </button>

          {onCancel && (
            <button type="button" className="text-button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default HomeScreen
