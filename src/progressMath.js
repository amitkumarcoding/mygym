const pad = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const r1 = (n) => Math.round(n * 10) / 10
export const est1 = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30))

export function series(logs, ex, metric) {
  const best = {}
  logs.filter((l) => l.ex === ex && l.kg > 0 && l.date).forEach((l) => {
    const v = r1(metric === 'Top weight' ? l.kg : est1(l.kg, l.reps))
    if (!best[l.date] || v > best[l.date].v) best[l.date] = { date: l.date, v, kg: l.kg, reps: l.reps }
  })
  let max = 0
  return Object.values(best).sort((a, b) => (a.date < b.date ? -1 : 1)).map((p, i) => {
    const pr = i > 0 && p.v > max
    max = Math.max(max, p.v)
    return { ...p, pr }
  })
}

export function weekBuckets(sessions, weeks = 8, now = new Date()) {
  const days = new Set(sessions)
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const out = []
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const s = new Date(monday)
    s.setDate(s.getDate() - 7 * i)
    const e = new Date(s)
    e.setDate(e.getDate() + 7)
    const a = iso(s)
    const b = iso(e)
    out.push({ start: a, label: s.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), n: [...days].filter((d) => d >= a && d < b).length })
  }
  return out
}
