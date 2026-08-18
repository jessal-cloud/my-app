const SECTIONS = [
  { key: 'sleep', label: 'Sleep', icon: '🌙', tone: 'sleep' },
  { key: 'feeding', label: 'Feeding', icon: '🍼', tone: 'feeding' },
  { key: 'milestones', label: 'Development', icon: '🌱', tone: 'milestones' },
  { key: 'safety', label: 'Safety', icon: '🛡️', tone: 'safety' },
]

function StageDetail({ stage, isCurrent, babyName }) {
  if (!stage) return null

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
    </div>
  )
}

export default StageDetail
