import { useEffect, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import Dashboard from './components/Dashboard'
import Disclaimer from './components/Disclaimer'
import { makeId } from './utils/id'
import './App.css'

const BABIES_KEY = 'little-steps-babies'
const ACTIVE_KEY = 'little-steps-active-id'

function App() {
  const [babies, setBabies] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [formMode, setFormMode] = useState(null) // null | 'add' | 'edit'
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedBabies = JSON.parse(localStorage.getItem(BABIES_KEY) ?? '[]')
      const savedActive = localStorage.getItem(ACTIVE_KEY)
      if (Array.isArray(savedBabies) && savedBabies.length > 0) {
        setBabies(savedBabies)
        setActiveId(savedBabies.some((b) => b.id === savedActive) ? savedActive : savedBabies[0].id)
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true)
  }, [])

  function persist(nextBabies, nextActiveId) {
    localStorage.setItem(BABIES_KEY, JSON.stringify(nextBabies))
    if (nextActiveId) localStorage.setItem(ACTIVE_KEY, nextActiveId)
  }

  function handleSave(data) {
    if (formMode === 'edit' && activeId) {
      const next = babies.map((b) => (b.id === activeId ? { ...b, ...data } : b))
      setBabies(next)
      persist(next, activeId)
    } else {
      const newBaby = { id: makeId(), growth: [], ...data }
      const next = [...babies, newBaby]
      setBabies(next)
      setActiveId(newBaby.id)
      persist(next, newBaby.id)
    }
    setFormMode(null)
  }

  function handleSwitch(id) {
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }

  function handleUpdateGrowth(babyId, growth) {
    const next = babies.map((b) => (b.id === babyId ? { ...b, growth } : b))
    setBabies(next)
    persist(next, activeId)
  }

  function handleRemove(id) {
    const next = babies.filter((b) => b.id !== id)
    setBabies(next)
    const nextActive = next[0]?.id ?? null
    setActiveId(nextActive)
    persist(next, nextActive ?? '')
    if (!nextActive) localStorage.removeItem(ACTIVE_KEY)
  }

  if (!loaded) return null

  const activeBaby = babies.find((b) => b.id === activeId) ?? null
  const isFirstBaby = babies.length === 0
  const effectiveMode = isFirstBaby ? 'welcome' : formMode
  const showForm = isFirstBaby || formMode !== null

  return (
    <div className="app-shell">
      <main className="app-main">
        {showForm ? (
          <HomeScreen
            mode={effectiveMode === 'edit' ? 'edit' : isFirstBaby ? 'welcome' : 'add'}
            initial={formMode === 'edit' ? activeBaby : null}
            onSave={handleSave}
            onCancel={isFirstBaby ? null : () => setFormMode(null)}
          />
        ) : (
          <Dashboard
            baby={activeBaby}
            babies={babies}
            onSwitch={handleSwitch}
            onAddChild={() => setFormMode('add')}
            onEditRequest={() => setFormMode('edit')}
            onRemove={handleRemove}
            onUpdateGrowth={(growth) => handleUpdateGrowth(activeBaby.id, growth)}
            key={activeBaby.id}
          />
        )}
      </main>
      <Disclaimer />
    </div>
  )
}

export default App
