import { stages } from '../data/stages'

const FIRST_YEAR = stages.filter((s) => s.maxMonths <= 12)
const TODDLER = stages.filter((s) => s.maxMonths > 12)

function StageBrowser({ selectedId, currentStageId, onSelect }) {
  return (
    <div className="stage-browser">
      <StageGroup
        title="First year (0–12 months)"
        items={FIRST_YEAR}
        selectedId={selectedId}
        currentStageId={currentStageId}
        onSelect={onSelect}
      />
      <StageGroup
        title="Toddler months (12–26 months)"
        items={TODDLER}
        selectedId={selectedId}
        currentStageId={currentStageId}
        onSelect={onSelect}
      />
    </div>
  )
}

function StageGroup({ title, items, selectedId, currentStageId, onSelect }) {
  return (
    <div className="stage-group">
      <h3 className="stage-group-title">{title}</h3>
      <div className="stage-pill-row">
        {items.map((stage) => {
          const isSelected = stage.id === selectedId
          const isCurrent = stage.id === currentStageId
          return (
            <button
              key={stage.id}
              type="button"
              className={`stage-pill${isSelected ? ' selected' : ''}${isCurrent ? ' current' : ''}`}
              onClick={() => onSelect(stage.id)}
            >
              {stage.ageLabel}
              {isCurrent && <span className="stage-pill-dot" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StageBrowser
