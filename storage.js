function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function loadWorkouts(date) {
  let d = date || getToday()
  let all = JSON.parse(localStorage.getItem('workouts') || '{}')
  return all[d] || []
}

function saveWorkouts(list, date) {
  let d = date || getToday()
  let all = JSON.parse(localStorage.getItem('workouts') || '{}')
  all[d] = list
  localStorage.setItem('workouts', JSON.stringify(all))
}

function loadAllWorkouts() {
  return JSON.parse(localStorage.getItem('workouts') || '{}')
}

function loadCalories() {
  let all = JSON.parse(localStorage.getItem('calories') || '{}')
  return all[getToday()] || []
}

function saveCalories(list) {
  let all = JSON.parse(localStorage.getItem('calories') || '{}')
  all[getToday()] = list
  localStorage.setItem('calories', JSON.stringify(all))
}

function loadGoals() {
  return JSON.parse(localStorage.getItem('goals') || '{"calGoal":2000,"protGoal":150}')
}

function saveGoals(g) {
  localStorage.setItem('goals', JSON.stringify(g))
}

function loadTheme() {
  return localStorage.getItem('theme') || 'dark'
}

function saveTheme(t) {
  localStorage.setItem('theme', t)
}
<<<<<<< HEAD

export { getToday, loadWorkouts, saveWorkouts, loadAllWorkouts, loadCalories, saveCalories, loadGoals, saveGoals, loadTheme, saveTheme }
=======
>>>>>>> f4f805c (Final code before 2nd milestone)
