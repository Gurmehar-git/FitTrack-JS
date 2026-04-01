const API_KEY = 'YOUR_API_NINJAS_KEY'

let currentTab = 'dashboard'
let editingId = null
let sets = []
let filterCat = 'all'
let searchText = ''
let chartType = 'calories'

document.addEventListener('DOMContentLoaded', function () {
  applyTheme(loadTheme())
  initSets()
  showTab('dashboard')
  renderDashboard()

  document.getElementById('hamburger').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open')
  })

  document.getElementById('themeBtn').addEventListener('click', function () {
    let newTheme = document.body.classList.contains('dark') ? 'light' : 'dark'
    applyTheme(newTheme)
    saveTheme(newTheme)
  })

  document.getElementById('exName').addEventListener('input', function () {
    showAutocomplete(this.value)
  })

  document.getElementById('exName').addEventListener('blur', function () {
    setTimeout(function () {
      document.getElementById('acDropdown').style.display = 'none'
    }, 150)
  })

  document.getElementById('addSetBtn').addEventListener('click', addSet)

  document.getElementById('workoutForm').addEventListener('submit', submitWorkout)

  document.getElementById('calForm').addEventListener('submit', submitMeal)

  document.getElementById('goalsForm').addEventListener('submit', submitGoals)

  document.getElementById('workoutSearch').addEventListener('input', function () {
    searchText = this.value.toLowerCase()
    renderWorkoutList()
  })

  document.getElementById('chartSelect').addEventListener('change', function () {
    chartType = this.value
    renderChart()
  })

  let g = loadGoals()
  document.getElementById('goalCalInput').value = g.calGoal
  document.getElementById('goalProtInput').value = g.protGoal
})

function applyTheme(theme) {
  document.body.className = theme
  document.getElementById('themeBtn').textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'
}

function showTab(tab) {
  currentTab = tab

  document.querySelectorAll('.tab').forEach(function (el) {
    el.classList.remove('active')
  })
  document.querySelectorAll('.nav-item').forEach(function (el) {
    el.classList.remove('active')
  })

  document.getElementById('tab-' + tab).classList.add('active')
  document.querySelector('[data-tab="' + tab + '"]').classList.add('active')

  document.getElementById('sidebar').classList.remove('open')

  if (tab === 'dashboard') renderDashboard()
  if (tab === 'workouts') renderWorkoutList()
  if (tab === 'calories') renderCalories()
}

function initSets() {
  sets = [
    { id: makeId(), weight: '', reps: '' },
    { id: makeId(), weight: '', reps: '' },
    { id: makeId(), weight: '', reps: '' },
  ]
  renderSetsTable()
}

function addSet() {
  let last = sets[sets.length - 1]
  sets.push({ id: makeId(), weight: last.weight, reps: last.reps })
  renderSetsTable()
}

function removeSet(id) {
  if (sets.length <= 1) return
  sets = sets.filter(function (s) { return s.id !== id })
  renderSetsTable()
}

function updateSet(id, field, val) {
  sets = sets.map(function (s) {
    if (s.id === id) {
      s[field] = val
    }
    return s
  })
  renderSetsTable()
}

function renderSetsTable() {
  let tbody = document.getElementById('setsBody')
  tbody.innerHTML = ''

  sets.forEach(function (s, i) {
    let vol = (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)

    let tr = document.createElement('tr')
    tr.innerHTML =
      '<td><div class="set-number">' + (i + 1) + '</div></td>' +
      '<td><input class="set-input" type="number" min="0" step="0.5" placeholder="0" value="' + s.weight + '" onchange="updateSet(\'' + s.id + '\', \'weight\', this.value)" /></td>' +
      '<td><input class="set-input" type="number" min="1" placeholder="0" value="' + s.reps + '" onchange="updateSet(\'' + s.id + '\', \'reps\', this.value)" /></td>' +
      '<td class="vol-text">' + (vol > 0 ? vol + ' kg' : '—') + '</td>' +
      '<td><button type="button" class="btn-icon red" onclick="removeSet(\'' + s.id + '\')">✕</button></td>'

    tbody.appendChild(tr)
  })
}

async function submitWorkout(e) {
  e.preventDefault()

  let name     = document.getElementById('exName').value.trim()
  let cat      = document.getElementById('exCat').value
  let notes    = document.getElementById('exNotes').value.trim()
  let duration = parseInt(document.getElementById('exDuration').value) || 30

  if (!name) return

  let validSets = sets.filter(function (s) { return parseInt(s.reps) > 0 })
  if (validSets.length === 0) return

  let setsData = validSets.map(function (s) {
    return { weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps) }
  })

  let calsBurnt = null

  try {
    let url = 'https://api.api-ninjas.com/v1/caloriesburned?activity=' + encodeURIComponent(name) + '&duration=' + duration
    let response = await fetch(url, {
      headers: { 'X-Api-Key': API_KEY }
    })
    let data = await response.json()
    if (data && data.length > 0) {
      calsBurnt = Math.round(data[0].total_calories)
    }
  } catch (err) {
    console.log('API call failed:', err)
  }

  let existing = loadWorkouts()

  if (editingId) {
    existing = existing.map(function (w) {
      if (w.id === editingId) {
        w.name = name
        w.category = cat
        w.notes = notes
        w.sets = setsData
      }
      return w
    })
    editingId = null
    document.getElementById('workoutSubmitBtn').textContent = 'Log Exercise'
    document.getElementById('cancelEditBtn').style.display = 'none'
  } else {
    let newWorkout = {
      id: makeId(),
      name: name,
      category: cat,
      notes: notes,
      sets: setsData,
      calsBurnt: calsBurnt,
      duration: duration,
      date: getToday()
    }
    existing.push(newWorkout)
  }

  saveWorkouts(existing)
  resetWorkoutForm()
  renderWorkoutList()
  showToast(calsBurnt ? 'Logged! API says ~' + calsBurnt + ' kcal burnt' : 'Exercise logged!')
}

function resetWorkoutForm() {
  document.getElementById('exName').value = ''
  document.getElementById('exCat').value = 'push'
  document.getElementById('exNotes').value = ''
  document.getElementById('exDuration').value = 30
  editingId = null
  document.getElementById('workoutSubmitBtn').textContent = 'Log Exercise'
  document.getElementById('cancelEditBtn').style.display = 'none'
  initSets()
}

function editWorkout(id) {
  let workouts = loadWorkouts()
  let w = workouts.find(function (x) { return x.id === id })
  if (!w) return

  editingId = id
  document.getElementById('exName').value = w.name
  document.getElementById('exCat').value = w.category
  document.getElementById('exNotes').value = w.notes || ''
  document.getElementById('exDuration').value = w.duration || 30

  sets = w.sets.map(function (s) {
    return { id: makeId(), weight: s.weight, reps: s.reps }
  })
  renderSetsTable()

  document.getElementById('workoutSubmitBtn').textContent = 'Update'
  document.getElementById('cancelEditBtn').style.display = 'inline-block'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function deleteWorkout(id) {
  let workouts = loadWorkouts().filter(function (w) { return w.id !== id })
  saveWorkouts(workouts)
  renderWorkoutList()
  showToast('Deleted')
}

function loadTemplate(type) {
  let exercises = TEMPLATES[type] || []
  let existing = loadWorkouts()

  exercises.forEach(function (e) {
    existing.push({
      id: makeId(),
      name: e.name,
      category: e.cat,
      notes: '',
      sets: e.sets.map(function (s) { return { weight: s.w, reps: s.r } }),
      calsBurnt: null,
      duration: 30,
      date: getToday()
    })
  })

  saveWorkouts(existing)
  renderWorkoutList()
  showToast(capitalize(type) + ' Day loaded!')
}

function setFilterCat(cat) {
  filterCat = cat
  document.querySelectorAll('.pill').forEach(function (p) {
    p.classList.remove('active')
  })
  document.querySelector('[data-cat="' + cat + '"]').classList.add('active')
  renderWorkoutList()
}

function renderWorkoutList() {
  let workouts = loadWorkouts()

  let displayed = workouts.filter(function (w) {
    let matchCat    = filterCat === 'all' || w.category === filterCat
    let matchSearch = w.name.toLowerCase().includes(searchText)
    return matchCat && matchSearch
  })

  document.getElementById('workoutCount').textContent = displayed.length + ' logged'

  let list = document.getElementById('workoutList')

  if (displayed.length === 0) {
    list.innerHTML = '<div class="empty-msg">No exercises yet. Log one above!</div>'
    return
  }

  list.innerHTML = ''

  displayed.forEach(function (w) {
    let totalReps = w.sets.reduce(function (a, s) { return a + s.reps }, 0)
    let maxWeight = Math.max.apply(null, w.sets.map(function (s) { return s.weight }))
    let totalVol  = w.sets.reduce(function (a, s) { return a + s.weight * s.reps }, 0)

    let setRows = w.sets.map(function (s, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + (s.weight > 0 ? s.weight + ' kg' : '—') + '</td>' +
        '<td>' + s.reps + ' reps</td>' +
        '<td class="vol-text">' + (s.weight > 0 ? (s.weight * s.reps) + ' kg' : '—') + '</td>' +
        '</tr>'
    }).join('')

    let card = document.createElement('div')
    card.className = 'workout-card'
    card.innerHTML =
      '<div class="wcard-top">' +
        '<div class="wcard-left">' +
          '<span class="cat-badge ' + w.category + '">' + capitalize(w.category) + '</span>' +
          '<span class="ex-name">' + w.name + '</span>' +
          (w.notes ? '<span class="ex-note">' + w.notes + '</span>' : '') +
        '</div>' +
        '<div class="wcard-buttons">' +
          '<button class="btn-icon" onclick="editWorkout(\'' + w.id + '\')">✎</button>' +
          '<button class="btn-icon red" onclick="deleteWorkout(\'' + w.id + '\')">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="chips-row">' +
        '<span class="chip">' + w.sets.length + ' sets</span>' +
        '<span class="chip">' + totalReps + ' reps</span>' +
        (maxWeight > 0 ? '<span class="chip">' + maxWeight + 'kg max</span>' : '') +
        (totalVol  > 0 ? '<span class="chip">' + totalVol  + 'kg vol</span>' : '') +
        (w.calsBurnt ? '<span class="burnt-chip">' + w.calsBurnt + ' kcal burnt</span>' : '') +
      '</div>' +
      '<details>' +
        '<summary>View sets</summary>' +
        '<table class="mini-table">' +
          '<thead><tr><th>#</th><th>Weight</th><th>Reps</th><th>Volume</th></tr></thead>' +
          '<tbody>' + setRows + '</tbody>' +
        '</table>' +
      '</details>'

    list.appendChild(card)
  })
}

function showAutocomplete(val) {
  let dropdown = document.getElementById('acDropdown')
  if (val.length < 2) {
    dropdown.style.display = 'none'
    return
  }

  let results = EXERCISES.filter(function (e) {
    return e.name.toLowerCase().includes(val.toLowerCase())
  }).slice(0, 6)

  if (results.length === 0) {
    dropdown.style.display = 'none'
    return
  }

  dropdown.innerHTML = ''
  dropdown.style.display = 'block'

  results.forEach(function (item) {
    let div = document.createElement('div')
    div.className = 'ac-option'
    div.innerHTML = '<span>' + item.name + '</span><span class="ac-cat-label">' + item.cat + '</span>'
    div.addEventListener('mousedown', function () {
      document.getElementById('exName').value = item.name
      document.getElementById('exCat').value  = item.cat
      dropdown.style.display = 'none'
    })
    dropdown.appendChild(div)
  })
}

function submitMeal(e) {
  e.preventDefault()

  let name    = document.getElementById('mealName').value.trim()
  let cal     = parseFloat(document.getElementById('mealCal').value) || 0
  let protein = parseFloat(document.getElementById('mealProt').value) || 0

  if (!name || cal <= 0) return

  let meals = loadCalories()
  meals.push({ id: makeId(), name: name, cal: cal, protein: protein })
  saveCalories(meals)

  document.getElementById('mealName').value = ''
  document.getElementById('mealCal').value  = ''
  document.getElementById('mealProt').value = ''

  renderCalories()
  showToast('Meal added!')
}

function deleteMeal(id) {
  let meals = loadCalories().filter(function (m) { return m.id !== id })
  saveCalories(meals)
  renderCalories()
  showToast('Deleted')
}

function submitGoals(e) {
  e.preventDefault()
  let g = {
    calGoal:  parseInt(document.getElementById('goalCalInput').value)  || 2000,
    protGoal: parseInt(document.getElementById('goalProtInput').value) || 150
  }
  saveGoals(g)
  renderCalories()
  showToast('Goals saved!')
}

function renderCalories() {
  let meals   = loadCalories()
  let goals   = loadGoals()
  let totalCal  = meals.reduce(function (a, m) { return a + m.cal }, 0)
  let totalProt = meals.reduce(function (a, m) { return a + m.protein }, 0)
  let calPct    = clamp(Math.round((totalCal  / goals.calGoal)  * 100), 0, 100)
  let protPct   = clamp(Math.round((totalProt / goals.protGoal) * 100), 0, 100)

  document.getElementById('totalCal').textContent  = Math.round(totalCal)
  document.getElementById('totalProt').textContent = Math.round(totalProt) + 'g'
  document.getElementById('calProgressBar').style.width  = calPct  + '%'
  document.getElementById('protProgressBar').style.width = protPct + '%'
  document.getElementById('calPctText').textContent  = calPct  + '% of ' + goals.calGoal
  document.getElementById('protPctText').textContent = protPct + '% of ' + goals.protGoal + 'g'

  let list = document.getElementById('mealList')
  document.getElementById('mealCount').textContent = meals.length + ' items'

  if (meals.length === 0) {
    list.innerHTML = '<div class="empty-msg">No meals logged today.</div>'
    return
  }

  list.innerHTML = ''
  meals.forEach(function (m) {
    let div = document.createElement('div')
    div.className = 'meal-card'
    div.innerHTML =
      '<div>' +
        '<div class="meal-name">' + m.name + '</div>' +
        '<div class="meal-info">' + m.cal + ' kcal' + (m.protein > 0 ? ' · ' + m.protein + 'g protein' : '') + '</div>' +
      '</div>' +
      '<button class="btn-icon red" onclick="deleteMeal(\'' + m.id + '\')">✕</button>'
    list.appendChild(div)
  })
}

function renderDashboard() {
  let workouts  = loadWorkouts()
  let meals     = loadCalories()
  let goals     = loadGoals()
  let allData   = loadAllWorkouts()

  let totalCal  = meals.reduce(function (a, m) { return a + m.cal }, 0)
  let totalProt = meals.reduce(function (a, m) { return a + m.protein }, 0)
  let totalSets = workouts.reduce(function (a, w) { return a + w.sets.length }, 0)
  let calsBurnt = workouts.reduce(function (a, w) { return a + (w.calsBurnt || 0) }, 0)
  let calPct    = clamp(Math.round((totalCal  / goals.calGoal)  * 100), 0, 100)
  let protPct   = clamp(Math.round((totalProt / goals.protGoal) * 100), 0, 100)

  let streak    = 0
  let checkDay  = new Date()
  while (true) {
    let key = checkDay.toISOString().slice(0, 10)
    if (allData[key] && allData[key].length > 0) {
      streak++
      checkDay.setDate(checkDay.getDate() - 1)
    } else {
      break
    }
  }

  document.getElementById('dashDate').textContent     = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  document.getElementById('dashWorkouts').textContent = workouts.length
  document.getElementById('dashSets').textContent     = totalSets
  document.getElementById('dashCal').textContent      = Math.round(totalCal)
  document.getElementById('dashBurnt').textContent    = calsBurnt > 0 ? calsBurnt : 0
  document.getElementById('dashCalBar').style.width   = calPct + '%'
  document.getElementById('dashProtBar').style.width  = protPct + '%'
  document.getElementById('dashCalPct').textContent   = calPct + '%'
  document.getElementById('dashProtPct').textContent  = protPct + '%'

  let streakEl = document.getElementById('streakBadge')
  if (streak > 0) {
    streakEl.textContent = streak + ' day streak!'
    streakEl.style.display = 'inline-flex'
  } else {
    streakEl.style.display = 'none'
  }

  let tips = []
  if (workouts.length === 0) tips.push('No workout logged today. Try loading a template!')
  if (totalProt < goals.protGoal * 0.5) tips.push('Protein is low. Add a protein rich meal.')
  if (calsBurnt > 0) tips.push('You burned around ' + calsBurnt + ' kcal from workouts today.')
  if (streak >= 3) tips.push(streak + ' day streak! Keep it going.')
  if (tips.length === 0) tips.push('All good today, keep it up!')

  let tipsEl = document.getElementById('tipsList')
  tipsEl.innerHTML = ''
  tips.forEach(function (t) {
    let div = document.createElement('div')
    div.className = 'tip-box'
    div.textContent = t
    tipsEl.appendChild(div)
  })

  renderChart()
}

function renderChart() {
  let days    = getLastNDays(7)
  let today   = getToday()
  let allData = loadAllWorkouts()
  let allCal  = JSON.parse(localStorage.getItem('calories') || '{}')

  let values = days.map(function (day) {
    if (chartType === 'calories') {
      return (allCal[day] || []).reduce(function (a, e) { return a + e.cal }, 0)
    } else {
      return (allData[day] || []).length
    }
  })

  let maxVal  = Math.max.apply(null, values.concat([1]))
  let container = document.getElementById('weekChart')
  container.innerHTML = ''

  days.forEach(function (day, i) {
    let val     = values[i]
    let isToday = day === today
    let pct     = Math.round((val / maxVal) * 100)
    let label   = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
    let tip     = val > 0 ? val + (chartType === 'calories' ? ' kcal' : ' ex') : 'none'

    let col = document.createElement('div')
    col.className = 'bar-column'

    let bar = document.createElement('div')
    bar.className = 'bar-block'
    bar.style.height      = pct + '%'
    bar.style.backgroundColor = isToday ? '#3b82f6' : '#2a2a2a'
    bar.style.border      = isToday ? '1px solid #3b82f6' : '1px solid #3a3a3a'
    bar.style.opacity     = val > 0 ? '1' : '0.3'
    bar.setAttribute('data-tip', tip)

    let lbl = document.createElement('span')
    lbl.className = 'bar-label'
    lbl.textContent = label
    lbl.style.color = isToday ? '#3b82f6' : '#555555'

    col.appendChild(bar)
    col.appendChild(lbl)
    container.appendChild(col)
  })
}
