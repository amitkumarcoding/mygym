import { exercises } from './exercises'

const all = Object.values(exercises).flat()
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim()
const ALIAS = {
  row: 'Barbell bent-over row',
  'barbell row': 'Barbell bent-over row',
  'seated row': 'Seated cable row',
  'incline press': 'Incline dumbbell press',
  'dumbbell press': 'Dumbbell bench press',
  curl: 'Barbell curl',
  'hamstring curl': 'Lying leg curl',
  'leg raise': 'Lying leg raise',
  pulldown: 'Lat pulldown',
}
const byName = (n) => all.find((e) => e.n === n) || null

const find = (raw) => {
  const t = norm(raw.trim().replace(/^then\s+/i, '').replace(/\s+\d.*$/, ''))
  if (!t || /minute|second|round|walk|jog|cycle|swim|run|stretch/.test(t)) return null
  if (ALIAS[t]) return byName(ALIAS[t])
  return all.find((e) => norm(e.n) === t) || all.find((e) => ` ${norm(e.n)} `.includes(` ${t} `)) || null
}

// Turns "Squat, bench press, plank · 3 × 10" into library exercises that have an animation.
export const exercisesIn = (detail) => {
  const seen = new Set()
  return detail
    .split('·')[0]
    .split(',')
    .flatMap((s) => s.split(/\s+and\s+/))
    .map(find)
    .filter((e) => e && !seen.has(e.n) && seen.add(e.n))
    .slice(0, 6)
}
