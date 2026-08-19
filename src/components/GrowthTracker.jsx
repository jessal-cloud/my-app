import { useState } from 'react'
import { makeId } from '../utils/id'
import { getAgeBreakdown, formatAgeLabel } from '../utils/age'
import LineChart from './LineChart'

const WEIGHT_COLOR = '#D9663D'
const HEIGHT_COLOR = '#2A6FA8'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function GrowthTracker({ baby, entries, onChange }) {
  const [date, setDate] = useState(todayStr())
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [error, setError] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!date) {
      setError('Please choose a date.')
      return
    }
    if (date > todayStr()) {
      setError('Date cannot be in the future.')
      return
    }
    if (date < baby.birthDate) {
      setError(`Date can't be before ${baby.name}'s birthdate.`)
      return
    }
    const weight = weightKg.trim() ? Number(weightKg) : null
    const height = heightCm.trim() ? Number(heightCm) : null
    if (weight === null && height === null) {
      setError('Enter a weight, a height, or both.')
      return
    }
    if ((weight !== null && weight <= 0) || (height !== null && height <= 0)) {
      setError('Measurements must be positive numbers.')
      return
    }
    setError('')
    const entry = { id: makeId(), date, weightKg: weight, heightCm: height }
    onChange([...entries, entry])
    setWeightKg('')
    setHeightCm('')
  }

  function handleRemove(id) {
    onChange(entries.filter((entry) => entry.id !== id))
  }

  const sortedDesc = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))
  const weightPoints = entries
    .filter((e) => e.weightKg != null)
    .map((e) => ({ id: e.id, date: new Date(e.date), value: e.weightKg }))
  const heightPoints = entries
    .filter((e) => e.heightCm != null)
    .map((e) => ({ id: e.id, date: new Date(e.date), value: e.heightCm }))

  return (
    <div className="growth-tracker">
      <div className="growth-note">
        <span className="growth-note-icon" aria-hidden="true">📋</span>
        <p>
          This is for your own personal tracking only — it isn't a diagnostic percentile chart. For
          official growth monitoring, use {baby.name}'s NHS red book (personal child health record) or
          ask your health visitor or GP.
        </p>
      </div>

      <form className="growth-form" onSubmit={handleAdd}>
        <label className="field growth-field">
          <span>Date</span>
          <input
            type="date"
            value={date}
            min={baby.birthDate}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field growth-field">
          <span>Weight (kg)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 6.2"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </label>
        <label className="field growth-field">
          <span>Height (cm)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            placeholder="e.g. 62.5"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </label>
        <button type="submit" className="primary-button growth-submit">
          Log measurement
        </button>
        {error && <p className="form-error growth-error">{error}</p>}
      </form>

      <div className="growth-charts">
        <div className="growth-chart-card">
          <h3>Weight</h3>
          {weightPoints.length >= 2 ? (
            <LineChart points={weightPoints} color={WEIGHT_COLOR} unit="kg" />
          ) : (
            <p className="growth-placeholder">
              {weightPoints.length === 1
                ? `Latest: ${weightPoints[0].value}kg. Log one more weight to see a trend line.`
                : 'Log at least two weight measurements to see a trend line.'}
            </p>
          )}
        </div>
        <div className="growth-chart-card">
          <h3>Height</h3>
          {heightPoints.length >= 2 ? (
            <LineChart points={heightPoints} color={HEIGHT_COLOR} unit="cm" />
          ) : (
            <p className="growth-placeholder">
              {heightPoints.length === 1
                ? `Latest: ${heightPoints[0].value}cm. Log one more height to see a trend line.`
                : 'Log at least two height measurements to see a trend line.'}
            </p>
          )}
        </div>
      </div>

      {sortedDesc.length > 0 && (
        <div className="growth-entries">
          <h3>Logged measurements</h3>
          <ul className="growth-entry-list">
            {sortedDesc.map((entry) => (
              <li key={entry.id} className="growth-entry">
                <div>
                  <p className="growth-entry-date">{formatFullDate(entry.date)}</p>
                  <p className="growth-entry-age">
                    {formatAgeLabel(getAgeBreakdown(baby.birthDate, new Date(entry.date)))}
                  </p>
                </div>
                <div className="growth-entry-values">
                  {entry.weightKg != null && <span>{entry.weightKg}kg</span>}
                  {entry.heightCm != null && <span>{entry.heightCm}cm</span>}
                </div>
                <button
                  type="button"
                  className="text-button growth-remove"
                  onClick={() => handleRemove(entry.id)}
                  aria-label={`Remove measurement from ${formatFullDate(entry.date)}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default GrowthTracker
