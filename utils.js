// utils.js

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function getLastNDays(n) {
  let days = []
  for (let i = n - 1; i >= 0; i--) {
    let d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// exercise library for autocomplete
const EXERCISES = [
  { name: 'Bench Press',             cat: 'push' },
  { name: 'Incline Bench Press',     cat: 'push' },
  { name: 'Dumbbell Press',          cat: 'push' },
  { name: 'Overhead Press',          cat: 'push' },
  { name: 'Arnold Press',            cat: 'push' },
  { name: 'Lateral Raises',          cat: 'push' },
  { name: 'Chest Flyes',             cat: 'push' },
  { name: 'Tricep Pushdown',         cat: 'push' },
  { name: 'Skull Crushers',          cat: 'push' },
  { name: 'Tricep Dips',             cat: 'push' },
  { name: 'Push-ups',                cat: 'push' },
  { name: 'Deadlift',                cat: 'pull' },
  { name: 'Romanian Deadlift',       cat: 'pull' },
  { name: 'Lat Pulldown',            cat: 'pull' },
  { name: 'Wide Grip Lat Pulldown',  cat: 'pull' },
  { name: 'Close Grip Lat Pulldown', cat: 'pull' },
  { name: 'Pull-ups',                cat: 'pull' },
  { name: 'Chin-ups',                cat: 'pull' },
  { name: 'Seated Cable Row',        cat: 'pull' },
  { name: 'Barbell Row',             cat: 'pull' },
  { name: 'Dumbbell Row',            cat: 'pull' },
  { name: 'Face Pulls',              cat: 'pull' },
  { name: 'Bicep Curls',             cat: 'pull' },
  { name: 'Hammer Curls',            cat: 'pull' },
  { name: 'Preacher Curls',          cat: 'pull' },
  { name: 'Shrugs',                  cat: 'pull' },
  { name: 'Squat',                   cat: 'legs' },
  { name: 'Front Squat',             cat: 'legs' },
  { name: 'Hack Squat',              cat: 'legs' },
  { name: 'Leg Press',               cat: 'legs' },
  { name: 'Leg Extension',           cat: 'legs' },
  { name: 'Leg Curl',                cat: 'legs' },
  { name: 'Bulgarian Split Squat',   cat: 'legs' },
  { name: 'Hip Thrust',              cat: 'legs' },
  { name: 'Lunges',                  cat: 'legs' },
  { name: 'Calf Raises',             cat: 'legs' },
  { name: 'Plank',                   cat: 'core' },
  { name: 'Crunches',                cat: 'core' },
  { name: 'Leg Raises',              cat: 'core' },
  { name: 'Russian Twists',          cat: 'core' },
  { name: 'Ab Wheel Rollout',        cat: 'core' },
  { name: 'Treadmill Run',           cat: 'cardio' },
  { name: 'Cycling',                 cat: 'cardio' },
  { name: 'Jump Rope',               cat: 'cardio' },
  { name: 'Rowing Machine',          cat: 'cardio' },
  { name: 'Elliptical',              cat: 'cardio' },
  { name: 'Burpees',                 cat: 'cardio' },
]

const TEMPLATES = {
  push: [
    { name: 'Bench Press',     cat: 'push', sets: [{w:60,r:8},{w:65,r:8},{w:70,r:6},{w:70,r:6}] },
    { name: 'Overhead Press',  cat: 'push', sets: [{w:40,r:10},{w:45,r:8},{w:45,r:8}] },
    { name: 'Lateral Raises',  cat: 'push', sets: [{w:10,r:15},{w:10,r:15},{w:12,r:12}] },
    { name: 'Tricep Pushdown', cat: 'push', sets: [{w:20,r:12},{w:22,r:12},{w:25,r:10}] },
  ],
  pull: [
    { name: 'Deadlift',         cat: 'pull', sets: [{w:100,r:5},{w:110,r:5},{w:120,r:3},{w:120,r:3}] },
    { name: 'Lat Pulldown',     cat: 'pull', sets: [{w:50,r:10},{w:55,r:10},{w:60,r:8}] },
    { name: 'Seated Cable Row', cat: 'pull', sets: [{w:55,r:10},{w:60,r:10},{w:65,r:8}] },
    { name: 'Hammer Curls',     cat: 'pull', sets: [{w:14,r:12},{w:16,r:12},{w:18,r:10}] },
  ],
  legs: [
    { name: 'Squat',      cat: 'legs', sets: [{w:80,r:8},{w:90,r:8},{w:100,r:6},{w:100,r:6}] },
    { name: 'Leg Press',  cat: 'legs', sets: [{w:120,r:12},{w:140,r:12},{w:160,r:10}] },
    { name: 'Leg Curl',   cat: 'legs', sets: [{w:40,r:12},{w:45,r:12},{w:50,r:10}] },
    { name: 'Calf Raises',cat: 'legs', sets: [{w:40,r:20},{w:45,r:20},{w:50,r:20}] },
  ],
  cardio: [
    { name: 'Treadmill Run', cat: 'cardio', sets: [{w:0,r:1}], notes: '30 min' },
    { name: 'Jump Rope',     cat: 'cardio', sets: [{w:0,r:100},{w:0,r:100},{w:0,r:100}] },
  ],
}

export { makeId, getLastNDays, clamp, capitalize, EXERCISES, TEMPLATES }
