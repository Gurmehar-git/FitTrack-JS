import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Workouts from './components/Workouts'
import Calories from './components/Calories'
import { loadTheme, saveTheme } from './storage'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [theme, setTheme] = useState(loadTheme())
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  function switchTheme() {
    let newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    saveTheme(newTheme)
  }

  function goTo(t) {
    setTab(t)
    setMenuOpen(false)
  }

  return (
    <div className="app">

      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="logo">
          FitTrack
          <span>Workout and Calorie Tracker</span>
        </div>

        <div className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => goTo('dashboard')}>
          Dashboard
        </div>
        <div className={`nav-item ${tab === 'workouts' ? 'active' : ''}`} onClick={() => goTo('workouts')}>
          Workouts
        </div>
        <div className={`nav-item ${tab === 'calories' ? 'active' : ''}`} onClick={() => goTo('calories')}>
          Calories
        </div>

        <div className="sidebar-bottom">
          <button className="theme-btn" onClick={switchTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <div className="top-bar">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <span style={{ fontWeight: 700, color: '#3b82f6' }}>FitTrack</span>
        <button className="hamburger" onClick={switchTheme}>{theme === 'dark' ? '☀' : '☾'}</button>
      </div>

      <main className="main-content">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'workouts'  && <Workouts />}
        {tab === 'calories'  && <Calories />}
      </main>

    </div>
  )
}
