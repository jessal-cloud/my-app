import { useMemo, useState } from 'react'
import { stages } from '../data/stages'
import { getAgeBreakdown, formatAgeLabel, findStageForMonths } from '../utils/age'
import StageDetail from './StageDetail'
import StageBrowser from './StageBrowser'
import ChildSwitcher from './ChildSwitcher'
import GrowthTracker from './GrowthTracker'

function Dashboard({ baby, babies, onSwitch, onAddChild, onEditRequest, onRemove, onUpdateGrowth }) {
  const [view, setView] = useState('now')
  const [selectedId, setSelectedId] = useState(null)

  const ageInfo = useMemo(() => getAgeBreakdown(baby.birthDate), [baby.birthDate])
  const currentStage = useMemo(() => findStageForMonths(stages, ageInfo.months), [ageInfo.months])
  const isBeyondRange = !ageInfo.isFuture && ageInfo.months >= 26
  const lastStage = stages[stages.length - 1]

  const activeStageId = selectedId ?? currentStage?.id ?? null
  const activeStage = stages.find((s) => s.id === activeStageId) ?? currentStage ?? null

  function handleSelectStage(id) {
    setSelectedId(id)
    setView('browse')
  }

  function goToToday() {
    setSelectedId(null)
    setView('now')
  }

  function handleRemove() {
    if (window.confirm(`Remove ${baby.name} from Little Steps? This can't be undone.`)) {
      onRemove(baby.id)
    }
  }

  return (
    <div className="dashboard">
      <ChildSwitcher babies={babies} activeId={baby.id} onSwitch={onSwitch} onAddChild={onAddChild} />

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Hello, {baby.name}'s grown-up 👋</p>
          <h1>{baby.name}</h1>
          <p className="dashboard-age">
            {ageInfo.isFuture ? 'Due soon — welcome, when the time comes!' : formatAgeLabel(ageInfo)}
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost-button" onClick={onEditRequest}>
            Edit details
          </button>
          <button type="button" className="ghost-button danger" onClick={handleRemove}>
            Remove
          </button>
        </div>
      </header>

      <nav className="tab-row">
        <button
          type="button"
          className={`tab-button${view === 'now' ? ' active' : ''}`}
          onClick={goToToday}
        >
          Right now
        </button>
        <button
          type="button"
          className={`tab-button${view === 'browse' ? ' active' : ''}`}
          onClick={() => setView('browse')}
        >
          Browse all stages
        </button>
        <button
          type="button"
          className={`tab-button${view === 'growth' ? ' active' : ''}`}
          onClick={() => setView('growth')}
        >
          Growth
        </button>
      </nav>

      {view === 'growth' && (
        <GrowthTracker baby={baby} entries={baby.growth ?? []} onChange={onUpdateGrowth} />
      )}

      {view === 'browse' && (
        <StageBrowser
          selectedId={activeStageId}
          currentStageId={currentStage?.id}
          onSelect={handleSelectStage}
        />
      )}

      {ageInfo.isFuture && view === 'now' && (
        <div className="empty-state">
          <p>
            {baby.name} hasn't arrived yet — check back after the big day, or browse the stages
            below to see what's ahead.
          </p>
          <button type="button" className="primary-button" onClick={() => setView('browse')}>
            Browse stages
          </button>
        </div>
      )}

      {isBeyondRange && view === 'now' && (
        <div className="empty-state">
          <p>
            {baby.name} is now past 26 months, which is as far as Little Steps' stage guides go
            for now. Here's the final stage we cover — feel free to browse any earlier stage too.
          </p>
          <StageDetail stage={lastStage} isCurrent={false} babyName={baby.name} />
        </div>
      )}

      {!ageInfo.isFuture && !isBeyondRange && view !== 'growth' && (
        <StageDetail
          stage={activeStage}
          isCurrent={activeStage?.id === currentStage?.id}
          babyName={baby.name}
        />
      )}
    </div>
  )
}

export default Dashboard
