import { useEffect, useMemo, useRef, useState } from 'react'
import { stages } from '../data/stages'
import { getAgeBreakdown, formatAgeLabel, findStageForMonths } from '../utils/age'
import { makeId } from '../utils/id'
import { addPhoto, getPhotosByBaby, deletePhoto } from '../utils/photoDb'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sortKeyForPhoto(photo) {
  if (photo.mode === 'date') return getAgeBreakdown(photo._birthDate, new Date(photo.dateTaken)).totalDays
  const stage = stages.find((s) => s.id === photo.stageId)
  return (stage?.minMonths ?? 0) * 30.44
}

function labelForPhoto(photo) {
  if (photo.mode === 'date') {
    const ageInfo = getAgeBreakdown(photo._birthDate, new Date(photo.dateTaken))
    return `${formatAgeLabel(ageInfo)} · ${formatFullDate(photo.dateTaken)}`
  }
  const stage = stages.find((s) => s.id === photo.stageId)
  return stage ? `${stage.ageLabel} · ${stage.name}` : 'Untagged'
}

function PhotoTimeline({ baby }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('date')
  const [dateTaken, setDateTaken] = useState(todayStr())
  const currentStage = findStageForMonths(stages, getAgeBreakdown(baby.birthDate).months)
  const [stageId, setStageId] = useState(currentStage?.id ?? stages[0].id)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [lightboxId, setLightboxId] = useState(null)
  const fileInputRef = useRef(null)
  const photosRef = useRef([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getPhotosByBaby(baby.id).then((records) => {
      if (cancelled) return
      const withUrls = records.map((r) => ({ ...r, url: URL.createObjectURL(r.blob) }))
      setPhotos(withUrls)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [baby.id])

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [])

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
      createdAt: Date.now(),
      blob: file,
    }
    await addPhoto(photo)
    setPhotos((prev) => [...prev, { ...photo, url: URL.createObjectURL(file) }])
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(id) {
    const photo = photos.find((p) => p.id === id)
    await deletePhoto(id)
    if (photo) URL.revokeObjectURL(photo.url)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setLightboxId((current) => (current === id ? null : current))
  }

  const decorated = useMemo(() => photos.map((p) => ({ ...p, _birthDate: baby.birthDate })), [photos, baby.birthDate])
  const sorted = useMemo(
    () => [...decorated].sort((a, b) => sortKeyForPhoto(a) - sortKeyForPhoto(b)),
    [decorated],
  )
  const lightboxPhoto = sorted.find((p) => p.id === lightboxId) ?? null

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
        <div className="photo-grid">
          {sorted.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="photo-card"
              onClick={() => setLightboxId(photo.id)}
            >
              <img src={photo.url} alt={labelForPhoto(photo)} className="photo-thumb" />
              <span className="photo-caption">{labelForPhoto(photo)}</span>
            </button>
          ))}
        </div>
      )}

      {lightboxPhoto && (
        <div className="photo-lightbox" onClick={() => setLightboxId(null)}>
          <div className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto.url} alt={labelForPhoto(lightboxPhoto)} />
            <div className="photo-lightbox-footer">
              <span>{labelForPhoto(lightboxPhoto)}</span>
              <div className="photo-lightbox-actions">
                <button type="button" className="text-button" onClick={() => handleDelete(lightboxPhoto.id)}>
                  Delete
                </button>
                <button type="button" className="ghost-button" onClick={() => setLightboxId(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoTimeline
