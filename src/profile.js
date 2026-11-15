import { goalNames, goalPlans } from './goals'
import { exercisesIn } from './planExercises'
import { plans } from './splits'

// One saved profile drives the whole plan: goal -> split -> today's workout.
// { goal, level, days, split, pos, done }  (split null = recommended, pos = next strength day)
export const LEVEL_OPTIONS = [['Beginner', 'Simple'], ['Intermediate', 'Hard'], ['Advanced', 'Very hard']]

const legacyGoal = () => {
  try {
    const g = localStorage.getItem('ironline-goal')
    return goalNames.includes(g) ? g : goalNames[0]
  } catch {
    return goalNames[0]
  }
}
export const goalOf = (p) => (p && goalNames.includes(p.goal) ? p.goal : legacyGoal())

export function buildWeek(profile) {
  const goal = goalOf(profile)
  const days = Number(profile?.days) || 3
  const goalRows = goalPlans[goal].train
  const options = [{ key: 'goal', label: `${goal} plan`, rows: goalRows }, ...Object.keys(plans).map((n) => ({ key: n, label: n, rows: plans[n] }))]
  const generic = days <= 3 ? 'Beginner full body' : days === 4 ? 'Upper / Lower' : 'Push Pull Legs'
  const recKey = goalRows.length === days ? 'goal' : generic
  const key = options.some((o) => o.key === profile?.split) ? profile.split : recKey
  const rows = options.find((o) => o.key === key).rows.map(([day, title, detail]) => ({ day, title, detail, list: exercisesIn(detail) }))
  const strength = rows.map((r, i) => (r.list.length ? i : -1)).filter((i) => i >= 0)
  const pos = strength.length ? (Number(profile?.pos) || 0) % strength.length : 0
  return { options, recKey, key, rows, strength, pos, today: strength.length ? rows[strength[pos]] : null }
}
