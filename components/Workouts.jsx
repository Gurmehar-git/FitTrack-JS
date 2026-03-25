import { useState, useEffect } from 'react'
import { loadWorkouts, saveWorkouts, getToday } from '../storage'
import { makeId, capitalize, EXERCISES, TEMPLATES } from '../utils'

const API_KEY = 'YOUR_API_NINJAS_KEY'

export default function Workouts() {
  const [workoutList, setWorkoutList] = useState([])
  const [exName,      setExName]      = useState('')
  const [exCat,       setExCat]       = useState('push')
  const [exNotes,     setExNotes]     = useState('')
  const [duration,    setDuration]    = useState(30)
  const [sets,        setSets]        = useState([
    { id: makeId(), weight: '', reps: '' },
    { id: makeId(), weight: '', reps: '' },
    { id: makeId(), weight: '', reps: '' },
  ])
  const [editingId,  setEditingId]  = useState(null)
  const [filterCat,  setFilterCat]  = useState('all')
  const [search,     setSearch]     = useState('')
  const [acList,     setAcList]     = useState([])

  useEffect(() => {
    setWorkoutList(loadWorkouts())
  }, [])

  function handleNameInput(val) {
    setExName(val)
    if (val.length < 2) {
      setAcList([])
      return
    }
    let results = EXERCISES.filter(e => e.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
    setAcList(results)
  }

  function pickExercise(item) {
    setExName(item.name)
    setExCat(item.cat)
    setAcList([])
  }

  function updateSet(id, field, val) {
    setSets(sets.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  function addSet() {
    let last = sets[sets.length - 1]
    setSets([...sets, { id: makeId(), weight: last.weight, reps: last.reps }])
  }

  function removeSet(id) {
    if (sets.length <= 1) return
    setSets(sets.filter(s => s.id !== id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!exName) return

    let validSets = sets.filter(s => parseInt(s.reps) > 0)
    if (validSets.length === 0) return

    let setsData = validSets.map(s => ({
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps)
    }))

    let calsBurnt = null
    try {
      let url = 'https://api.api-ninjas.com/v1/caloriesburned?activity=' + encodeURIComponent(exName) + '&duration=' + duration
      let res  = await fetch(url, { headers: { 'X-Api-Key': API_KEY } })
      let data = await res.json()
      if (data.length > 0) {
        calsBurnt = Math.round(data[0].total_calories)
      }
    } catch (err) {
      console.log('api error:', err)
    }

    let existing = loadWorkouts()

    if (editingId) {
      let updated = existing.map(w => {
        if (w.id === editingId) {
          return { ...w, name: exName, category: exCat, notes: exNotes, sets: setsData }
        }
        return w
      })
      saveWorkouts(updated)
      setEditingId(null)
    } else {
      let newWorkout = {
        id: makeId(),
        name: exName,
        category: exCat,
        notes: exNotes,
        sets: setsData,
        calsBurnt: calsBurnt,
        duration: duration,
        date: getToday()
      }
      saveWorkouts([...existing, newWorkout])
    }

    setWorkoutList(loadWorkouts())
    resetForm()
  }

  function resetForm() {
    setExName('')
    setExCat('push')
    setExNotes('')
    setDuration(30)
    setEditingId(null)
    setSets([
      { id: makeId(), weight: '', reps: '' },
      { id: makeId(), weight: '', reps: '' },
      { id: makeId(), weight: '', reps: '' },
    ])
  }

  function handleEdit(id) {
    let w = workoutList.find(x => x.id === id)
    if (!w) return
    setEditingId(id)
    setExName(w.name)
    setExCat(w.category)
    setExNotes(w.notes || '')
    setDuration(w.duration || 30)
    setSets(w.sets.map(s => ({ id: makeId(), weight: s.weight, reps: s.reps })))
  }

  function handleDelete(id) {
    let updated = workoutList.filter(w => w.id !== id)
    saveWorkouts(updated)
    setWorkoutList(updated)
  }

  function loadTemplate(type) {
    let exercises = TEMPLATES[type] || []
    let existing  = loadWorkouts()
    let newOnes   = exercises.map(e => ({
      id: makeId(),
      name: e.name,
      category: e.cat,
      notes: '',
      sets: e.sets.map(s => ({ weight: s.w, reps: s.r })),
      calsBurnt: null,
      duration: 30,
      date: getToday()
    }))
    saveWorkouts([...existing, ...newOnes])
    setWorkoutList(loadWorkouts())
  }

  let displayed = workoutList
    .filter(w => filterCat === 'all' || w.category === filterCat)
    .filter(w => w.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-title">Workouts</div>
      <div className="page-subtitle">Log exercises — calories burnt fetched from API</div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Quick Templates</span>
        </div>
        <div className="tmpl-row">
          <button className="btn-small" onClick={() => loadTemplate('push')}>Push Day</button>
          <button className="btn-small" onClick={() => loadTemplate('pull')}>Pull Day</button>
          <button className="btn-small" onClick={() => loadTemplate('legs')}>Leg Day</button>
          <button className="btn-small" onClick={() => loadTemplate('cardio')}>Cardio</button>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">{editingId ? 'Edit Exercise' : 'Log Exercise'}</span>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group" style={{ position: 'relative', marginBottom: '12px', maxWidth: '320px' }}>
            <label>Exercise Name</label>
            <input
              value={exName}
              onChange={e => handleNameInput(e.target.value)}
              placeholder="e.g. Bench Press"
              required
              autoComplete="off"
            />
            {acList.length > 0 && (
              <div className="ac-dropdown">
                {acList.map(item => (
                  <div key={item.name} className="ac-option" onMouseDown={() => pickExercise(item)}>
                    <span>{item.name}</span>
                    <span className="ac-cat-label">{item.cat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-row" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label>Category</label>
              <select value={exCat} onChange={e => setExCat(e.target.value)}>
                <option value="push">Push</option>
                <option value="pull">Pull</option>
                <option value="legs">Legs</option>
                <option value="cardio">Cardio</option>
                <option value="core">Core</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (mins)</label>
              <input
                type="number" min="1" max="180"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 30)}
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input value={exNotes} onChange={e => setExNotes(e.target.value)} placeholder="optional" />
            </div>
          </div>

          <div className="sets-box">
            <div className="sets-top">
              <span>Sets</span>
              <button type="button" className="btn-small" onClick={addSet}>+ Add Set</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Weight (kg)</th>
                  <th>Reps</th>
                  <th>Volume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sets.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <div className="set-number">{i + 1}</div>
                    </td>
                    <td>
                      <input
                        className="set-input"
                        type="number" min="0" step="0.5"
                        value={s.weight}
                        placeholder="0"
                        onChange={e => updateSet(s.id, 'weight', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="set-input"
                        type="number" min="1"
                        value={s.reps}
                        placeholder="0"
                        onChange={e => updateSet(s.id, 'reps', e.target.value)}
                      />
                    </td>
                    <td className="vol-text">
                      {(parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) > 0
                        ? (parseFloat(s.weight) * parseInt(s.reps)) + ' kg'
                        : '—'}
                    </td>
                    <td>
                      <button type="button" className="btn-icon red" onClick={() => removeSet(s.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button type="submit" className="btn">{editingId ? 'Update' : 'Log Exercise'}</button>
            {editingId && (
              <button type="button" className="btn-gray" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="filter-row">
          <input
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="pills">
            {['all', 'push', 'pull', 'legs', 'cardio', 'core'].map(f => (
              <button key={f} className={`pill ${filterCat === f ? 'active' : ''}`} onClick={() => setFilterCat(f)}>
                {capitalize(f)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <span className="card-title">Today's Exercises</span>
          <span className="count-label">{displayed.length} logged</span>
        </div>

        {displayed.length === 0 && <div className="empty-msg">No exercises yet. Log one above!</div>}

        {displayed.map(w => {
          let totalReps = w.sets.reduce((a, s) => a + s.reps, 0)
          let maxWeight = Math.max(...w.sets.map(s => s.weight))
          let totalVol  = w.sets.reduce((a, s) => a + s.weight * s.reps, 0)

          return (
            <div key={w.id} className="workout-card">
              <div className="wcard-top">
                <div className="wcard-left">
                  <span className={`cat-badge ${w.category}`}>{capitalize(w.category)}</span>
                  <span className="ex-name">{w.name}</span>
                  {w.notes && <span className="ex-note">{w.notes}</span>}
                </div>
                <div className="wcard-buttons">
                  <button className="btn-icon" onClick={() => handleEdit(w.id)}>✎</button>
                  <button className="btn-icon red" onClick={() => handleDelete(w.id)}>✕</button>
                </div>
              </div>

              <div className="chips-row">
                <span className="chip">{w.sets.length} sets</span>
                <span className="chip">{totalReps} reps</span>
                {maxWeight > 0 && <span className="chip">{maxWeight}kg max</span>}
                {totalVol  > 0 && <span className="chip">{totalVol}kg vol</span>}
                {w.calsBurnt && <span className="burnt-chip">{w.calsBurnt} kcal burnt</span>}
              </div>

              <details>
                <summary>View sets</summary>
                <table className="mini-table">
                  <thead>
                    <tr><th>#</th><th>Weight</th><th>Reps</th><th>Volume</th></tr>
                  </thead>
                  <tbody>
                    {w.sets.map((s, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{s.weight > 0 ? s.weight + ' kg' : '—'}</td>
                        <td>{s.reps} reps</td>
                        <td className="vol-text">{s.weight > 0 ? (s.weight * s.reps) + ' kg' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          )
        })}
      </div>
    </div>
  )
}
