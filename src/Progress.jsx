import { useEffect, useState } from 'react'
import { getLiftLogs } from './liftStore'
import { Pills } from './Tracking'
import { series, weekBuckets, r1 } from './progressMath'
import './progress.css'

const readJson = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback } catch { return fallback }
}
const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })

function useTick() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const bump = () => setTick((t) => t + 1)
    window.addEventListener('ironline-store', bump)
    window.addEventListener('storage', bump)
    return () => { window.removeEventListener('ironline-store', bump); window.removeEventListener('storage', bump) }
  }, [])
  return tick
}

function LiftChart() {
  useTick()
  const logs = getLiftLogs().filter((l) => l && l.ex && l.kg > 0)
  const names = [...new Set(logs.map((l) => l.ex))]
  const [ex, setEx] = useState('')
  const [metric, setMetric] = useState('Est. 1RM')
  const [sel, setSel] = useState(null)
  const cur = names.includes(ex) ? ex : names[0]
  const pts = cur ? series(logs, cur, metric) : []

  if (!names.length) return <p className="empty">Log a lift above and your strength graph appears here.</p>

  const W = 640, H = 250, L = 46, R = 16, T = 16, B = 32
  const vals = pts.map((p) => p.v)
  const mn = Math.min(...vals), mx = Math.max(...vals)
  const span = mx - mn || Math.max(mx * 0.1, 1)
  const lo = mn - span * 0.2, hi = mx + span * 0.2
  const t0 = pts.length ? new Date(pts[0].date).getTime() : 0
  const t1 = pts.length ? new Date(pts[pts.length - 1].date).getTime() : 1
  const x = (p, i) => L + (pts.length < 2 ? (W - L - R) / 2 : (t1 === t0 ? i / (pts.length - 1) : (new Date(p.date).getTime() - t0) / (t1 - t0))) * (pts.length < 2 ? 1 : W - L - R)
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B)
  const line = pts.map((p, i) => `${x(p, i)},${y(p.v)}`).join(' ')
  const area = pts.length > 1 ? `M${x(pts[0], 0)},${H - B} L${line.replaceAll(' ', ' L')} L${x(pts[pts.length - 1], pts.length - 1)},${H - B}Z` : ''
  const grid = [0, 1, 2].map((g) => lo + ((hi - lo) * (g + 0.5)) / 3)
  const si = sel !== null && sel < pts.length ? sel : pts.length - 1
  const s = pts[si]
  const first = pts[0], last = pts[pts.length - 1]
  const change = r1(last.v - first.v)
  const prs = pts.filter((p) => p.pr).length

  return (
    <div className="card pg-card">
      <div className="pg-head">
        <label>Exercise
          <select value={cur} onChange={(e) => { setEx(e.target.value); setSel(null) }}>
            {names.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <Pills items={['Est. 1RM', 'Top weight']} value={metric} onChange={(m) => { setMetric(m); setSel(null) }} label="Chart metric" />
      </div>
      <div className="pg-stats">
        <div><b>{last.v} kg</b><span>Latest</span></div>
        <div><b className={change > 0 ? 'up' : change < 0 ? 'down' : ''}>{change > 0 ? '+' : ''}{change} kg</b><span>Since first log</span></div>
        <div><b>{Math.max(...vals)} kg</b><span>Best</span></div>
        <div><b>{prs}</b><span>New PRs</span></div>
      </div>
      {pts.length < 2 ? (
        <p className="empty">One session logged for {cur}. Log it on another day to draw the trend.</p>
      ) : (
        <>
          <p className="pg-read" aria-live="polite"><b>{s.v} kg</b> on {fmt(s.date)} · {s.kg} kg × {s.reps}{s.pr ? ' · PR' : ''}</p>
          <svg className="pg-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${cur} ${metric} from ${first.v} to ${last.v} kilograms over ${pts.length} sessions`}>
            <defs>
              <linearGradient id="pgArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--gold)', stopOpacity: 0.32 }} />
                <stop offset="1" style={{ stopColor: 'var(--gold)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {grid.map((g) => (
              <g key={g}><line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="pg-grid" /><text x={L - 8} y={y(g) + 4} textAnchor="end" className="pg-txt">{Math.round(g)}</text></g>
            ))}
            <path d={area} fill="url(#pgArea)" />
            <polyline points={line} className="pg-line" />
            {pts.map((p, i) => (
              <circle key={p.date} cx={x(p, i)} cy={y(p.v)} r={i === si ? 7 : p.pr ? 5.5 : 4} className={`pg-dot${p.pr ? ' pr' : ''}${i === si ? ' on' : ''}`}
                tabIndex={0} role="button" aria-label={`${fmt(p.date)}: ${p.v} kilograms`} onClick={() => setSel(i)} onFocus={() => setSel(i)} onPointerEnter={() => setSel(i)} />
            ))}
            <text x={L} y={H - 8} className="pg-txt">{fmt(first.date)}</text>
            <text x={W - R} y={H - 8} textAnchor="end" className="pg-txt">{fmt(last.date)}</text>
          </svg>
          <p className="pg-key"><i /> Gold dots are new personal bests</p>
        </>
      )}
    </div>
  )
}

function Consistency() {
  useTick()
  const sessions = readJson('ironline-workouts', []).filter((d) => typeof d === 'string')
  const goal = Math.max(1, Number(readJson('ironline-weekly-goal', 4)) || 4)
  const weeks = weekBuckets(sessions, 8)
  const total = weeks.reduce((a, w) => a + w.n, 0)
  const best = Math.max(...weeks.map((w) => w.n))
  const hit = weeks.filter((w) => w.n >= goal).length
  const W = 640, H = 200, L = 28, B = 30, T = 22
  const max = Math.max(goal, best, 1)
  const bw = (W - L - 8) / weeks.length
  const y = (n) => T + (1 - n / max) * (H - T - B)

  return (
    <div className="card pg-card">
      <div className="pg-stats">
        <div><b>{total}</b><span>Workouts, 8 weeks</span></div>
        <div><b>{r1(total / 8)}</b><span>Per week</span></div>
        <div><b>{hit} / 8</b><span>Weeks at goal</span></div>
      </div>
      {total === 0 ? (
        <p className="empty">Tap “I trained today” in your goal section to start building your weekly graph.</p>
      ) : (
        <svg className="pg-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Workouts per week over 8 weeks: ${weeks.map((w) => w.n).join(', ')}. Weekly goal ${goal}.`}>
          <line x1={L} x2={W - 8} y1={y(goal)} y2={y(goal)} className="pg-goal" />
          <text x={W - 8} y={y(goal) - 6} textAnchor="end" className="pg-txt">Goal {goal}</text>
          {weeks.map((w, i) => (
            <g key={w.start}>
              <rect x={L + i * bw + bw * 0.18} y={y(w.n)} width={bw * 0.64} height={Math.max(H - B - y(w.n), w.n ? 2 : 0)} rx="6" className={`pg-bar${w.n >= goal ? ' hit' : ''}`} />
              {w.n > 0 && <text x={L + i * bw + bw / 2} y={y(w.n) - 6} textAnchor="middle" className="pg-txt hi">{w.n}</text>}
              <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="pg-txt">{w.label}</text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

export default function ProgressCharts() {
  return (
    <div className="pg">
      <h3 className="goal-sub">Strength progress</h3>
      <LiftChart />
      <h3 className="goal-sub">Training consistency</h3>
      <Consistency />
    </div>
  )
}
