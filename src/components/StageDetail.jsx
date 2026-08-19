import PhotoGallery from './PhotoGallery'

const SECTIONS = [
  { key: 'sleep', label: 'Sleep', icon: '🌙', tone: 'sleep' },
  { key: 'feeding', label: 'Feeding', icon: '🍼', tone: 'feeding' },
  { key: 'milestones', label: 'Development', icon: '🌱', tone: 'milestones' },
  { key: 'safety', label: 'Safety', icon: '🛡️', tone: 'safety' },
]

function StageDetail({ stage, isCurrent, babyName, photos, photosLoading, onDeletePhoto, onAddPhotoForStage }) {
  if (!stage) return null

  const stagePhotos = (photos ?? []).filter((p) => p.mode === 'stage' && p.stageId === stage.id)

  return (
    <div className="stage-detail">
      <div className="stage-detail-header">
        <div>
          <p className="stage-detail-range">{stage.ageLabel}</p>
          <h2>{stage.name}</h2>
        </div>
        {isCurrent && <span className="badge-today">{babyName ? `${babyName} is here` : "You are here"}</span>}
      </div>
      <p className="stage-detail-overview">{stage.overview}</p>

      <div className="section-grid">
        {SECTIONS.map(({ key, label, icon, tone }) => (
          <section className={`info-card tone-${tone}`} key={key}>
            <h3>
              <span className="info-icon" aria-hidden="true">{icon}</span>
              {label}
            </h3>
            <ul>
              {stage[key].map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {onAddPhotoForStage && (
        <section className="stage-photos">
          <h3 className="stage-photos-title">Photos from this stage</h3>
          {photosLoading ? (
            <p className="growth-placeholder">Loading photos…</p>
          ) : stagePhotos.length === 0 ? (
            <div className="stage-photos-empty">
              <p>No photos tagged to {stage.ageLabel} yet.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => onAddPhotoForStage(stage.id)}
              >
                Add a photo
              </button>
            </div>
          ) : (
            <PhotoGallery photos={stagePhotos} onDelete={onDeletePhoto} />
          )}
        </section>
      )}
    </div>
  )
}

export default StageDetail
