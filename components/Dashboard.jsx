import { useState, useEffect } from 'react'
import { loadWorkouts, loadAllWorkouts, loadCalories, loadGoals, getToday } from '../storage'
import { getLastNDays, clamp } from '../utils'

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  const [meals, setMeals]       = useState([])
  const [goals, setGoals]       = useState({ calGoal: 2000, protGoal: 150 })
  const [chartType, setChartType] = useState('calories')

  useEffect(() => {
    setWorkouts(loadWorkouts())
    setMeals(loadCalories())
    setGoals(loadGoals())
  }, [])

  let totalCal   = meals.reduce((a, m) => a + m.cal, 0)
  let totalProt  = meals.reduce((a, m) => a + m.protein, 0)
  let totalSets  = workouts.reduce((a, w) => a + w.sets.length, 0)
  let calsBurnt  = workouts.reduce((a, w) => a + (w.calsBurnt || 0), 0)

  let calPct  = clamp(Math.round((totalCal  / goals.calGoal)  * 100), 0, 100)
  let protPct = clamp(Math.round((totalProt / goals.protGoal) * 100), 0, 100)

  let streak  = 0
  let allData = loadAllWorkouts()
  let checkDay = new Date()
  while (true) {
    let key = checkDay.toISOString().slice(0, 10)
    if (allData[key] && allData[key].length > 0) {
      streak++
      checkDay.setDate(checkDay.getDate() - 1)
    } else {
      break
    }
  }

  let days     = getLastNDays(7)
  let today    = getToday()
  let allCal   = JSON.parse(localStorage.getItem('calories') || '{}')

  let chartData = days.map(day => {
    let val = chartType === 'calories'
      ? (allCal[day]  || []).reduce((a, e) => a + e.cal, 0)
      : (allData[day] || []).length
    return {
      label: new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      val: val,
      isToday: day === today
    }
  })

  let maxVal = Math.max(...chartData.map(d => d.val), 1)

  let tips = []
  if (workouts.length === 0) tips.push('No workout logged today. Try loading a template!')
  if (totalProt < goals.protGoal * 0.5) tips.push('Protein is low. Add a protein rich meal.')
  if (calsBurnt > 0) tips.push('You burned around ' + calsBurnt + ' kcal from workouts today.')
  if (streak >= 3) tips.push(streak + ' day streak! Keep it going.')
  if (tips.length === 0) tips.push('All good today, keep it up!')

  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-subtitle">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      {streak > 0 && (
        <div className="streak-badge">
          {streak} day streak!
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-label">Workouts</div>
          <div className="stat-number">{workouts.length}</div>
          <div className="stat-sub">today</div>
        </div>
        <div className="stat-box orange">
          <div className="stat-label">Total Sets</div>
          <div className="stat-number">{totalSets}</div>
          <div className="stat-sub">performed</div>
        </div>
        <div className="stat-box green">
          <div className="stat-label">Calories Eaten</div>
          <div className="stat-number">{Math.round(totalCal)}</div>
          <div className="stat-sub">kcal</div>
        </div>
        <div className="stat-box red">
          <div className="stat-label">Calories Burnt</div>
          <div className="stat-number">{calsBurnt > 0 ? calsBurnt : 0}</div>
          <div className="stat-sub">from workouts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Goal Progress</span>
        </div>
        <div className="goal-row">
          <label>Calories</label>
          <div className="progress-bar-bg" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: calPct + '%' }}></div>
          </div>
          <span className="goal-pct">{calPct}%</span>
        </div>
        <div className="goal-row">
          <label>Protein</label>
          <div className="progress-bar-bg" style={{ flex: 1 }}>
            <div className="progress-bar-fill green" style={{ width: protPct + '%' }}></div>
          </div>
          <span className="goal-pct">{protPct}%</span>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">This Week</span>
          <select
            className="btn-small"
            value={chartType}
            onChange={e => setChartType(e.target.value)}
            style={{ cursor: 'pointer', width: 'auto' }}
          >
            <option value="calories">Calories</option>
            <option value="workouts">Workouts</option>
          </select>
        </div>
        <div className="week-chart">
          {chartData.map((item, i) => (
            <div key={i} className="bar-column">
              <div
                className="bar-block"
                style={{
                  height: Math.round((item.val / maxVal) * 100) + '%',
                  backgroundColor: item.isToday ? '#3b82f6' : '#2a2a2a',
                  border: item.isToday ? '1px solid #3b82f6' : '1px solid #3a3a3a',
                  opacity: item.val > 0 ? 1 : 0.3
                }}
                data-tip={item.val > 0 ? item.val + (chartType === 'calories' ? ' kcal' : ' ex') : 'none'}
              />
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Suggestions</span>
        </div>
        {tips.map((t, i) => (
          <div key={i} className="tip-box">{t}</div>
        ))}
      </div>
    </div>
  )
}
