import { useMemo, useRef, useState } from 'react'
import { stages } from '../data/stages'
import { getAgeBreakdown, findStageForMonths } from '../utils/age'
import { makeId } from '../utils/id'
import { sortKeyForPhoto } from '../utils/photoLabel'
import PhotoGallery from './PhotoGallery'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function PhotoTimeline({ baby, photos, loading, onAddPhoto, onDeletePhoto, initialStageId }) {
  const currentStage = findStageForMonths(stages, getAgeBreakdown(baby.birthDate).months)
  const [mode, setMode] = useState(initialStageId ? 'stage' : 'date')
  const [dateTaken, setDateTaken] = useState(todayStr())
  const [stageId, setStageId] = useState(initialStageId ?? currentStage?.id ?? stages[0].id)
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function handleAdd(e) {
    e.preventDefault()
    if (!file) {
      setError('Please choose a photo to upload.')
      return
    }
    if (mode === 'date') {
      if (!dateTaken) {
        setError('Please choose a date.')
        return
      }
      if (dateTaken > todayStr()) {
        setError('Date cannot be in the future.')
        return
      }
      if (dateTaken < baby.birthDate) {
        setError(`Date can't be before ${baby.name}'s birthdate.`)
        return
      }
    }
    setError('')
    const photo = {
      id: makeId(),
      babyId: baby.id,
      mode,
      dateTaken: mode === 'date' ? dateTaken : null,
      stageId: mode === 'stage' ? stageId : null,
      caption: caption.trim() || null,
      createdAt: Date.now(),
      blob: file,
    }
    await onAddPhoto(photo, file)
    setFile(null)
    setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const decorated = useMemo(() => photos.map((p) => ({ ...p, _birthDate: baby.birthDate })), [photos, baby.birthDate])
  const sorted = useMemo(
    () => [...decorated].sort((a, b) => sortKeyForPhoto(a) - sortKeyForPhoto(b)),
    [decorated],
  )

  return (
    <div className="photo-timeline">
      <form className="photo-form" onSubmit={handleAdd}>
        <label className="field photo-field">
          <span>Photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className="field photo-field photo-caption-field">
          <span>Caption (optional)</span>
          <input
            type="text"
            value={caption}
            maxLength={80}
            placeholder="e.g. First trip to the park"
            onChange={(e) => setCaption(e.target.value)}
          />
        </label>

        <div className="photo-tag-mode">
          <button
            type="button"
            className={`tag-mode-button${mode === 'date' ? ' active' : ''}`}
            onClick={() => setMode('date')}
          >
            Specific date
          </button>
          <button
            type="button"
            className={`tag-mode-button${mode === 'stage' ? ' active' : ''}`}
            onClick={() => setMode('stage')}
          >
            Stage
          </button>
        </div>

        {mode === 'date' ? (
          <label className="field photo-field">
            <span>Date taken</span>
            <input
              type="date"
              value={dateTaken}
              min={baby.birthDate}
              max={todayStr()}
              onChange={(e) => setDateTaken(e.target.value)}
            />
          </label>
        ) : (
          <label className="field photo-field">
            <span>Stage</span>
            <select value={stageId} onChange={(e) => setStageId(e.target.value)}>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ageLabel} · {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button type="submit" className="primary-button photo-submit">
          Add photo
        </button>
        {error && <p className="form-error photo-error">{error}</p>}
      </form>

      {loading ? (
        <p className="growth-placeholder">Loading photos…</p>
      ) : sorted.length === 0 ? (
        <p className="growth-placeholder">No photos yet — add {baby.name}'s first one above.</p>
      ) : (
        <PhotoGallery photos={sorted} onDelete={onDeletePhoto} />
      )}
    </div>
  )
}

export default PhotoTimeline
