import { useEffect, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import Dashboard from './components/Dashboard'
import Disclaimer from './components/Disclaimer'
import './App.css'

const STORAGE_KEY = 'little-steps-baby'

function App() {
  const [baby, setBaby] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setBaby(JSON.parse(saved))
      } catch {
        /* ignore corrupt storage */
      }
    }
    setLoaded(true)
  }, [])

  function handleSave(newBaby) {
    setBaby(newBaby)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBaby))
    setEditing(false)
  }

  if (!loaded) return null

  const showHomeScreen = !baby || editing

  return (
    <div className="app-shell">
      <main className="app-main">
        {showHomeScreen ? (
          <HomeScreen onSave={handleSave} initial={editing ? baby : null} />
        ) : (
          <Dashboard baby={baby} onEditRequest={() => setEditing(true)} />
        )}
      </main>
      <Disclaimer />
    </div>
  )
}

export default App
