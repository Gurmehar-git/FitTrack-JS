import { useState, useEffect } from 'react'
import { loadCalories, saveCalories, loadGoals, saveGoals } from '../storage'
import { makeId, clamp } from '../utils'

export default function Calories() {
  const [meals,    setMeals]    = useState([])
  const [goals,    setGoals]    = useState({ calGoal: 2000, protGoal: 150 })
  const [name,     setName]     = useState('')
  const [cal,      setCal]      = useState('')
  const [protein,  setProtein]  = useState('')
  const [calGoal,  setCalGoal]  = useState(2000)
  const [protGoal, setProtGoal] = useState(150)

  useEffect(() => {
    let saved = loadCalories()
    let g     = loadGoals()
    setMeals(saved)
    setGoals(g)
    setCalGoal(g.calGoal)
    setProtGoal(g.protGoal)
  }, [])

  function addMeal(e) {
    e.preventDefault()
    if (!name || !cal) return

    let newMeal = {
      id: makeId(),
      name: name,
      cal: parseFloat(cal),
      protein: parseFloat(protein) || 0
    }

    let updated = [...meals, newMeal]
    setMeals(updated)
    saveCalories(updated)
    setName('')
    setCal('')
    setProtein('')
  }

  function deleteMeal(id) {
    let updated = meals.filter(m => m.id !== id)
    setMeals(updated)
    saveCalories(updated)
  }

  function saveGoalsForm(e) {
    e.preventDefault()
    let newGoals = {
      calGoal: parseInt(calGoal) || 2000,
      protGoal: parseInt(protGoal) || 150
    }
    setGoals(newGoals)
    saveGoals(newGoals)
  }

  let totalCal  = meals.reduce((a, m) => a + m.cal, 0)
  let totalProt = meals.reduce((a, m) => a + m.protein, 0)
  let calPct    = clamp(Math.round((totalCal  / goals.calGoal)  * 100), 0, 100)
  let protPct   = clamp(Math.round((totalProt / goals.protGoal) * 100), 0, 100)

  return (
    <div>
      <div className="page-title">Calories</div>
      <div className="page-subtitle">Track your daily food and protein intake</div>

      <div className="cal-totals">
        <div className="cal-box">
          <div className="cal-number">{Math.round(totalCal)}</div>
          <div className="cal-label">Calories</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: calPct + '%' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#555555', marginTop: '3px' }}>{calPct}% of {goals.calGoal}</div>
        </div>
        <div className="cal-box">
          <div className="cal-number green">{Math.round(totalProt)}g</div>
          <div className="cal-label">Protein</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill green" style={{ width: protPct + '%' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#555555', marginTop: '3px' }}>{protPct}% of {goals.protGoal}g</div>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Add Meal</span>
        </div>
        <form onSubmit={addMeal}>
          <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            <div className="form-group">
              <label>Food Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken Breast" required />
            </div>
            <div className="form-group">
              <label>Calories</label>
              <input type="number" value={cal} onChange={e => setCal(e.target.value)} placeholder="350" min="0" required />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="30" min="0" />
            </div>
          </div>
          <button type="submit" className="btn">Add Meal</button>
        </form>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Set Goals</span>
        </div>
        <form onSubmit={saveGoalsForm}>
          <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Calorie Goal</label>
              <input type="number" value={calGoal} onChange={e => setCalGoal(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Protein Goal (g)</label>
              <input type="number" value={protGoal} onChange={e => setProtGoal(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn">Save Goals</button>
        </form>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Today's Meals</span>
          <span className="count-label">{meals.length} items</span>
        </div>

        {meals.length === 0 && <div className="empty-msg">No meals logged today.</div>}

        {meals.map(m => (
          <div key={m.id} className="meal-card">
            <div>
              <div className="meal-name">{m.name}</div>
              <div className="meal-info">
                {m.cal} kcal{m.protein > 0 ? ' · ' + m.protein + 'g protein' : ''}
              </div>
            </div>
            <button className="btn-icon red" onClick={() => deleteMeal(m.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
