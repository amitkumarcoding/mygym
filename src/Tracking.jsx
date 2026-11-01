import { useEffect, useMemo, useState } from 'react'
import { exercises } from './exercises'
import { goalNames, goalPlans } from './goals'

function useStored(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be blocked (private mode). The tracker still works for this visit.
    }
  }, [key, value])
  return [value, setValue]
}

const today = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const round1 = (n) => Math.round(n * 10) / 10
const oneRm = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30))

function Pills({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item} type="button" aria-pressed={value === item} onClick={() => onChange(item)}>{item}</button>
      ))}
    </div>
  )
}

export function GoalPlans({ goal, setGoal }) {
  const plan = goalPlans[goal]
  return (
    <>
      <Pills items={goalNames} value={goal} onChange={setGoal} label="Fitness goal" />
      <div className="goal-head">
        <p className="diet-note">{plan.blurb}</p>
        <span className="goal-days">{plan.days}</span>
      </div>
      <div className="goal-cols">
        <div>
          <h3 className="goal-sub">Exercise</h3>
          <div className="goal-list">
            {plan.train.map(([day, title, detail]) => (
              <div className="slot goal-slot" key={day + title}>
                <span className="slot-time">{day}</span>
                <strong>{title}</strong>
                <span className="slot-note">{detail}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="goal-sub">Diet</h3>
          <p className="goal-diet-note">{plan.diet.note}</p>
          <div className="goal-list">
            {plan.diet.meals.map(([meal, food]) => (
              <div className="slot goal-slot" key={meal}>
                <span className="slot-time">{meal}</span>
                <strong>{food}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="note">Your goal is saved on this device and shows up in the progress tracker below.</p>
    </>
  )
}

const allLifts = Object.values(exercises).flat().map((ex) => ex.n)

export function PRTracker() {
  const [logs, setLogs] = useStored('ironline-prs', [])
  const [targets, setTargets] = useStored('ironline-pr-targets', {})
  const [f, setF] = useState({ ex: 'Barbell bench press', kg: '', reps: '', date: today() })
  const [msg, setMsg] = useState(null)
  const set = (key) => (event) => setF({ ...f, [key]: event.target.value })

  const submit = (event) => {
    event.preventDefault()
    const kg = Number(f.kg)
    const reps = Math.floor(Number(f.reps))
    if (!(kg > 0) || !(reps >= 1) || reps > 50) return setMsg({ bad: true, text: 'Enter a weight above 0 and reps between 1 and 50.' })
    const prev = logs.filter((l) => l.ex === f.ex)
    const bestPrev = prev.reduce((m, l) => Math.max(m, oneRm(l.kg, l.reps)), 0)
    const heavyPrev = prev.reduce((m, l) => Math.max(m, l.kg), 0)
    const est = oneRm(kg, reps)
    setLogs([{ id: uid(), ex: f.ex, kg, reps, date: f.date || today() }, ...logs])
    if (!prev.length) setMsg({ text: `First ${f.ex} logged. That is your starting point.` })
    else if (kg > heavyPrev) setMsg({ pr: true, text: `New PR! ${kg} kg on ${f.ex}, up from ${heavyPrev} kg.` })
    else if (est > bestPrev) setMsg({ pr: true, text: `New strength PR! Estimated max is now ${round1(est)} kg.` })
    else setMsg({ text: 'Logged. Keep pushing for the next PR.' })
    setF({ ...f, kg: '', reps: '' })
  }

  const records = useMemo(() => {
    const map = {}
    logs.forEach((l) => {
      const r = map[l.ex] || (map[l.ex] = { ex: l.ex, heavy: null, est: 0, count: 0, last: l.date })
      r.count += 1
      if (!r.heavy || l.kg > r.heavy.kg || (l.kg === r.heavy.kg && l.reps > r.heavy.reps)) r.heavy = l
      r.est = Math.max(r.est, oneRm(l.kg, l.reps))
      if (l.date > r.last) r.last = l.date
    })
    return Object.values(map).sort((a, b) => (a.last < b.last ? 1 : -1))
  }, [logs])

  const setTarget = (ex, value) => setTargets((t) => ({ ...t, [ex]: value }))

  return (
    <>
      <form className="card pr-form" onSubmit={submit} noValidate>
        <h3>Log a lift</h3>
        <div className="pr-grid">
          <label>Exercise
            <select value={f.ex} onChange={set('ex')}>
              {Object.entries(exercises).map(([group, list]) => (
                <optgroup label={group} key={group}>
                  {list.map((ex) => <option key={ex.n} value={ex.n}>{ex.n}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label>Weight (kg)<input type="number" min="0" step="0.5" inputMode="decimal" value={f.kg} onChange={set('kg')} /></label>
          <label>Reps<input type="number" min="1" max="50" inputMode="numeric" value={f.reps} onChange={set('reps')} /></label>
          <label>Date<input type="date" max={today()} value={f.date} onChange={set('date')} /></label>
        </div>
        {msg && <p className={msg.bad ? 'err' : msg.pr ? 'pr-win' : 'note'} role="status">{msg.text}</p>}
        <button className="btn gold" type="submit">Save lift</button>
      </form>

      {records.length === 0 ? (
        <p className="empty">No lifts yet. Log your first set above and your personal records will appear here.</p>
      ) : (
        <>
          <h3 className="goal-sub">Your records</h3>
          <div className="cards pr-cards">
            {records.map((r) => {
              const target = Number(targets[r.ex])
              const pct = target > 0 ? Math.min(100, Math.round((r.heavy.kg / target) * 100)) : 0
              const left = target > 0 ? round1(target - r.heavy.kg) : 0
              return (
                <article className="slot pr-card" key={r.ex}>
                  <span className="slot-time">{r.count} {r.count === 1 ? 'log' : 'logs'} · last {fmtDate(r.last)}</span>
                  <strong>{r.ex}</strong>
                  <div className="pr-stats">
                    <div><b>{r.heavy.kg} kg</b><span>Best × {r.heavy.reps}</span></div>
                    <div><b>{round1(r.est)} kg</b><span>Est. 1 rep max</span></div>
                  </div>
                  <label className="pr-target">Goal max (kg)
                    <input type="number" min="0" step="0.5" inputMode="decimal" value={targets[r.ex] ?? ''} onChange={(e) => setTarget(r.ex, e.target.value)} placeholder="Set a target" />
                  </label>
                  {target > 0 && (
                    <div className="bar-wrap">
                      <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={`Progress to goal on ${r.ex}`}><i style={{ width: `${pct}%` }} /></div>
                      <small>{left > 0 ? `${left} kg to go · ${pct}%` : 'Goal reached. Set a higher one.'}</small>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <h3 className="goal-sub">Recent lifts</h3>
          <ul className="log-list">
            {logs.slice(0, 8).map((l) => (
              <li key={l.id}>
                <span>{fmtDate(l.date)}</span>
                <b>{l.ex}</b>
                <span>{l.kg} kg × {l.reps}</span>
                <button type="button" aria-label={`Delete ${l.ex} ${l.kg} kilograms`} onClick={() => setLogs(logs.filter((x) => x.id !== l.id))}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="note">Estimated 1 rep max uses the Epley formula. Only lift a true max with a spotter and good form.</p>
    </>
  )
}

function WeightChart({ points }) {
  if (points.length < 2) return <p className="empty">Add at least two weigh-ins to see your trend.</p>
  const W = 640
  const H = 200
  const pad = 28
  const vals = points.map((p) => p.kg)
  const lo = Math.min(...vals) - 1
  const hi = Math.max(...vals) + 1
  const x = (i) => pad + (i * (W - pad * 2)) / (points.length - 1)
  const y = (v) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2)
  const line = points.map((p, i) => `${x(i)},${y(p.kg)}`).join(' ')
  return (
    <svg className="wchart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bodyweight from ${points[0].kg} to ${points[points.length - 1].kg} kilograms`}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} className="axis" />
      <polyline points={line} className="wline" />
      {points.map((p, i) => <circle key={p.id} cx={x(i)} cy={y(p.kg)} r="4" className="wdot" />)}
      <text x={pad} y={H - 8} className="wtxt">{fmtDate(points[0].date)}</text>
      <text x={W - pad} y={H - 8} className="wtxt" textAnchor="end">{fmtDate(points[points.length - 1].date)}</text>
      <text x={pad} y={16} className="wtxt">{round1(hi - 1)} kg</text>
      <text x={W - pad} y={16} className="wtxt" textAnchor="end">{round1(lo + 1)} kg</text>
    </svg>
  )
}

const weekStart = () => {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ProgressTracker({ goal }) {
  const [body, setBody] = useStored('ironline-body', [])
  const [target, setTarget] = useStored('ironline-body-target', '')
  const [sessions, setSessions] = useStored('ironline-workouts', [])
  const [weekly, setWeekly] = useStored('ironline-weekly-goal', 4)
  const [f, setF] = useState({ date: today(), kg: '', waist: '' })
  const [err, setErr] = useState('')
  const set = (key) => (event) => setF({ ...f, [key]: event.target.value })

  const submit = (event) => {
    event.preventDefault()
    const kg = Number(f.kg)
    const waist = f.waist === '' ? null : Number(f.waist)
    if (!(kg >= 20 && kg <= 400)) return setErr('Enter a bodyweight between 20 and 400 kg.')
    if (waist !== null && !(waist >= 30 && waist <= 250)) return setErr('Waist should be between 30 and 250 cm, or leave it empty.')
    setErr('')
    const rest = body.filter((b) => b.date !== f.date)
    setBody([...rest, { id: uid(), date: f.date || today(), kg, waist }].sort((a, b) => (a.date < b.date ? -1 : 1)))
    setF({ ...f, kg: '', waist: '' })
  }

  const first = body[0]
  const latest = body[body.length - 1]
  const change = first && latest ? round1(latest.kg - first.kg) : 0
  const goalKg = Number(target)
  let pct = 0
  if (first && latest && goalKg > 0 && first.kg !== goalKg) {
    pct = Math.max(0, Math.min(100, Math.round(((first.kg - latest.kg) / (first.kg - goalKg)) * 100)))
  }
  const waistPts = body.filter((b) => b.waist !== null)
  const waistChange = waistPts.length > 1 ? round1(waistPts[waistPts.length - 1].waist - waistPts[0].waist) : null

  const trainedToday = sessions.includes(today())
  const thisWeek = sessions.filter((d) => d >= weekStart()).length
  const weekGoal = Math.max(1, Number(weekly) || 1)
  const weekPct = Math.min(100, Math.round((thisWeek / weekGoal) * 100))
  const streak = (() => {
    const days = new Set(sessions)
    let count = 0
    const d = new Date()
    if (!days.has(today())) d.setDate(d.getDate() - 1)
    for (;;) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!days.has(iso)) break
      count += 1
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  const toggleToday = () => setSessions(trainedToday ? sessions.filter((d) => d !== today()) : [...sessions, today()])

  return (
    <>
      <div className="prog-top">
        <div className="card prog-card">
          <p className="s-lbl">Your goal</p>
          <h3 className="prog-goal">{goal}</h3>
          <p className="note">Change it in the goal plans above.</p>
          <div className="prog-week">
            <div className="prog-row"><b>{thisWeek} / {weekGoal}</b><span>workouts this week</span></div>
            <div className="bar"><i style={{ width: `${weekPct}%` }} /></div>
            <div className="prog-meta">
              <span>{streak} day streak · {sessions.length} total</span>
              <label>Weekly goal
                <select value={weekly} onChange={(e) => setWeekly(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} days</option>)}
                </select>
              </label>
            </div>
            <button type="button" className={`btn ${trainedToday ? 'ghost' : 'gold'}`} onClick={toggleToday}>{trainedToday ? 'Undo today' : 'I trained today'}</button>
          </div>
        </div>

        <form className="card prog-card" onSubmit={submit} noValidate>
          <h3>Log a weigh-in</h3>
          <div className="pr-grid two">
            <label>Date<input type="date" max={today()} value={f.date} onChange={set('date')} /></label>
            <label>Bodyweight (kg)<input type="number" min="20" step="0.1" inputMode="decimal" value={f.kg} onChange={set('kg')} /></label>
            <label>Waist (cm, optional)<input type="number" min="30" step="0.5" inputMode="decimal" value={f.waist} onChange={set('waist')} /></label>
            <label>Target weight (kg)<input type="number" min="20" step="0.1" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} /></label>
          </div>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn gold" type="submit">Save weigh-in</button>
        </form>
      </div>

      {body.length > 0 && (
        <div className="card prog-chart">
          <div className="results prog-results">
            <div><b>{latest.kg} kg</b><span>Current</span></div>
            <div><b>{change > 0 ? '+' : ''}{change} kg</b><span>Since start</span></div>
            {waistChange !== null && <div><b>{waistChange > 0 ? '+' : ''}{waistChange} cm</b><span>Waist change</span></div>}
            {goalKg > 0 && <div><b>{pct}%</b><span>To target</span></div>}
          </div>
          {goalKg > 0 && <div className="bar"><i style={{ width: `${pct}%` }} /></div>}
          <WeightChart points={body} />
          <ul className="log-list">
            {[...body].reverse().slice(0, 6).map((b) => (
              <li key={b.id}>
                <span>{fmtDate(b.date)}</span>
                <b>{b.kg} kg</b>
                <span>{b.waist !== null ? `${b.waist} cm waist` : ''}</span>
                <button type="button" aria-label={`Delete weigh-in from ${fmtDate(b.date)}`} onClick={() => setBody(body.filter((x) => x.id !== b.id))}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {body.length === 0 && <p className="empty">Log your first weigh-in to start tracking. Weigh yourself at the same time each week for the cleanest trend.</p>}
      <p className="note">Everything is saved in this browser only. Clearing site data will erase it.</p>
    </>
  )
}
