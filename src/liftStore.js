const LOCAL_KEY = 'ironline-prs' // legacy key: PRTracker moves anything stored here to the cloud after sign-in
const WORKOUT_KEY = 'ironline-workouts'

let logs = []
let saver = null

export const getLiftLogs = () => logs

export const setLiftLogs = (next) => {
  logs = next
  window.dispatchEvent(new Event('ironline-store'))
}

// PRTracker registers a saver once the signed-in user's cloud data has loaded, and clears it on sign-out.
export const setLiftSaver = (fn) => {
  saver = fn
}

const readLocal = () => {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

// Adds lifts to the cloud when signed in, otherwise keeps them on this device until the user signs in.
// Returns 'cloud', 'local', 'failed' or 'none'.
export function addLifts(entries) {
  if (!entries.length) return 'none'
  if (saver) {
    saver(entries)
    return 'cloud'
  }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...entries, ...readLocal()]))
    window.dispatchEvent(new Event('ironline-store'))
    return 'local'
  } catch {
    return 'failed'
  }
}

// Most recent logged set for an exercise (newest date wins; for the same date the newest entry wins).
export function getLastLift(ex) {
  const all = [...logs, ...readLocal()].filter((l) => l && l.ex === ex && l.kg > 0)
  return all.reduce((best, l) => (!best || (l.date || '') > (best.date || '') ? l : best), null)
}

const pad = (n) => String(n).padStart(2, '0')
export const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Marks today as a training day. Same storage the "I trained today" button uses, so streaks update on their own.
export function markTrainedToday() {
  try {
    const raw = JSON.parse(localStorage.getItem(WORKOUT_KEY) || '[]')
    const days = Array.isArray(raw) ? raw : []
    const t = todayIso()
    if (!days.includes(t)) {
      localStorage.setItem(WORKOUT_KEY, JSON.stringify([...days, t]))
      window.dispatchEvent(new Event('ironline-store'))
    }
    return true
  } catch {
    return false
  }
}
