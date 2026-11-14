import { useEffect, useMemo, useRef, useState } from 'react'
import { registerPush, saveSubscription, saveFee, saveReminders, watchUserData, useUser, signInWithGoogle, signOutUser } from './push'
import { exercises, frames, DUR } from './exercises'
import { goalNames } from './goals'
import { GoalPlans, PRTracker } from './Tracking'
import Body from 'react-muscle-highlighter'
import SearchModal from './Search'
import { Checklist, Gear, Avoid } from './Gear'
import { useReveal, useScrollState, usePointerGlow, CountUp } from './Motion'
import './App.css'
import './polish.css'
import './refine.css'

const BRAND = 'Ironline'
const REMINDER_KEY = 'ironline-reminders'

const plans = {
  'Beginner full body': [['Mon', 'Full body A', 'Squat, bench press, lat pulldown, plank'], ['Wed', 'Full body B', 'Deadlift, overhead press, seated row, lunge'], ['Fri', 'Full body C', 'Leg press, incline press, cable row, cable crunch']],
  'Push Pull Legs': [['Day 1', 'Push', 'Bench press, overhead press, incline press, lateral raise, pushdown'], ['Day 2', 'Pull', 'Deadlift, lat pulldown, cable row, face pull, barbell curl'], ['Day 3', 'Legs', 'Squat, Romanian deadlift, lunge, calf raise, plank'], ['Day 4', 'Rest', 'Walk 30 minutes and stretch. Repeat the cycle.']],
  'Upper / Lower': [['Mon', 'Upper', 'Bench press, row, overhead press, curl, pushdown'], ['Tue', 'Lower', 'Squat, Romanian deadlift, lunge, calf raise'], ['Thu', 'Upper', 'Incline press, pulldown, lateral raise, face pull'], ['Fri', 'Lower', 'Deadlift, leg press, hamstring curl, plank']],
}

const diets = {
  'Muscle gain': { note: 'About 300 kcal above maintenance, 1.8–2.2 g protein per kg bodyweight.', meals: [['Breakfast', 'Oats with milk, banana, 3 eggs'], ['Lunch', 'Rice, dal, paneer or chicken, salad'], ['Snack', 'Curd with peanuts, one fruit'], ['Dinner', 'Roti, sabzi, chicken or soya, curd'], ['Before bed', 'Glass of milk, handful of almonds']] },
  'Fat loss': { note: 'About 400 kcal below maintenance, high protein, plenty of fibre.', meals: [['Breakfast', 'Veg omelette, 1 toast, green tea'], ['Lunch', '2 rotis, dal, large salad, curd'], ['Snack', 'Roasted chana or sprouts, fruit'], ['Dinner', 'Grilled chicken or paneer, sauteed veg'], ['Hydration', '3–4 litres of water through the day']] },
  Maintain: { note: 'Eat at maintenance calories, balanced plate, 1.6 g protein per kg.', meals: [['Breakfast', 'Poha or upma, boiled eggs, fruit'], ['Lunch', 'Rice, dal, sabzi, curd'], ['Snack', 'Nuts, buttermilk or fruit'], ['Dinner', 'Roti, paneer or fish, vegetables']] },
}

const faqs = [
  { name: 'Is it really free?', text: 'Yes. Every exercise guide, workout plan, diet plan and calculator is free, with no sign-up needed and no hidden fees. Signing in with Google is optional and only syncs your records across devices.' },
  { name: 'How many days should I train?', text: 'Beginners do well with 3 full body days. Add a fourth or fifth day only when you recover well and your lifts keep going up.' },
  { name: 'How much protein do I need?', text: 'Aim for 1.6 to 2.2 g per kg of bodyweight a day. The calculator below works out your exact number.' },
  { name: 'Should I check with a doctor first?', text: 'If you have an injury, a health condition or have not trained in years, speak to a doctor or qualified trainer before starting.' },
]

const defaultMeals = [
  { id: 'b', label: 'Breakfast', time: '08:00', on: true },
  { id: 'l', label: 'Lunch', time: '13:00', on: true },
  { id: 's', label: 'Snack', time: '17:00', on: false },
  { id: 'd', label: 'Dinner', time: '20:30', on: true },
]

const FEE_PLANS = [1, 3, 6, 9, 12]
const pad2 = (n) => String(n).padStart(2, '0')
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const makeDefaultFee = () => withNext({ on: false, plan: 1, paidOn: toDateStr(new Date()), time: '09:00' })

// Paid on + plan months = next payment. Short months are handled (31 Jan + 1 month = 28/29 Feb).
function feeDueDate(fee) {
  const [y, m, d] = fee.paidOn.split('-').map(Number)
  const [h, min] = fee.time.split(':').map(Number)
  const target = new Date(y, m - 1 + fee.plan, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay), h, min)
}

// The next payment date is stored with the fee, so it is saved (and synced) once you pay.
function withNext(fee) {
  return { ...fee, nextDue: toDateStr(feeDueDate(fee)), history: Array.isArray(fee.history) ? fee.history.slice(0, 6) : [] }
}

const showDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const isWater = (w) => w && typeof w.on === 'boolean' && [30, 45, 60, 90, 120].includes(w.mins)
const isMeals = (m) => Array.isArray(m) && m.length <= 8 && m.every((meal) =>
  meal && typeof meal.id === 'string' && typeof meal.label === 'string'
  && /^\d{2}:\d{2}$/.test(meal.time) && typeof meal.on === 'boolean')

function readReminderSettings() {
  const defaults = { water: { on: false, mins: 60, since: Date.now() }, meals: defaultMeals, fee: makeDefaultFee() }

  try {
    const stored = JSON.parse(localStorage.getItem(REMINDER_KEY) || 'null')
    if (!stored || typeof stored !== 'object') return { ...defaults, storageError: false }
    const water = stored.water
    const meals = stored.meals
    return {
      water: water && typeof water.on === 'boolean' && [30, 45, 60, 90, 120].includes(water.mins)
        ? { ...water, since: water.since || Date.now() }
        : defaults.water,
      meals: Array.isArray(meals) && meals.every((meal) =>
        meal && typeof meal.id === 'string' && typeof meal.label === 'string'
        && /^\d{2}:\d{2}$/.test(meal.time) && typeof meal.on === 'boolean')
        ? meals
        : defaults.meals,
      fee: stored.fee && typeof stored.fee.on === 'boolean' && FEE_PLANS.includes(stored.fee.plan)
        && /^\d{4}-\d{2}-\d{2}$/.test(stored.fee.paidOn) && /^\d{2}:\d{2}$/.test(stored.fee.time)
        ? withNext(stored.fee)
        : defaults.fee,
      remUpdated: Number(stored.remUpdated) || 0,
      storageError: false,
    }
  } catch {
    return { ...defaults, storageError: true }
  }
}

const PR_KEY = 'ironline-prs'
const readLogs = () => {
  try {
    const a = JSON.parse(localStorage.getItem(PR_KEY) || '[]')
    return Array.isArray(a) ? a.filter((l) => l && l.ex && l.kg > 0) : []
  } catch {
    return []
  }
}
const est1 = (kg, reps) => (reps <= 1 ? kg : kg * (1 + reps / 30))
const topLifts = (logs) => {
  const m = {}
  ;[...logs].reverse().sort((x, y) => ((x.date || '') < (y.date || '') ? -1 : (x.date || '') > (y.date || '') ? 1 : 0)).forEach((l) => {
    const r = m[l.ex] || (m[l.ex] = { ex: l.ex, kg: 0, reps: 0, up: 0, last: l.date || '' })
    if (l.kg > r.kg) { r.up = r.kg ? Math.round((l.kg - r.kg) * 10) / 10 : 0; r.kg = l.kg; r.reps = l.reps }
    else if (l.kg === r.kg && l.reps > r.reps) r.reps = l.reps
    if ((l.date || '') > r.last) r.last = l.date || ''
  })
  return Object.values(m).sort((a, b) => (a.last < b.last ? 1 : -1))
}
const demoRows = [
  { ex: 'Bench press', kg: 100, reps: 5, up: 5 },
  { ex: 'Squat', kg: 140, reps: 5, up: 10 },
  { ex: 'Deadlift', kg: 180, reps: 3, up: 10 },
]

function HeroPulse() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = (new Date().getDay() + 6) % 7
  return (
    <aside className="hp" aria-label="Sample training session">
      <svg className="hp-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="26" className="hp-track" />
        <circle cx="32" cy="32" r="26" className="hp-arc" pathLength="100" />
      </svg>
      <div className="hp-txt"><b>45<small> min</small></b><span><u />Today's session</span></div>
      <svg className="hp-ecg" viewBox="0 0 220 36" aria-hidden="true">
        <path pathLength="100" d="M0 20 H46 L54 20 L60 6 L68 32 L75 14 L80 20 H128 L136 20 L142 4 L150 33 L157 14 L162 20 H220" />
      </svg>
      <div className="hp-days" aria-hidden="true">
        {days.map((d, i) => <span key={i} className={i < today ? 'hp-on' : i === today ? 'hp-now' : ''}>{d}</span>)}
      </div>
    </aside>
  )
}

function Lifts() {
  const init = useRef(null)
  if (init.current === null) init.current = readLogs()
  const prev = useRef(init.current)
  const prevJson = useRef(JSON.stringify(init.current))
  const hold = useRef(0)
  const listRef = useRef(null)
  const [logs, setLogs] = useState(init.current)
  const [i, setI] = useState(0)
  const [flash, setFlash] = useState(null)
  const [n, setN] = useState(0)
  const list = useMemo(() => topLifts(logs), [logs])
  const rows = list.length ? list : demoRows
  const k = i % rows.length
  const cur = rows[k]
  const kg = flash ? flash.kg : cur.kg
  const reps = flash ? flash.reps : cur.reps
  const maxKg = Math.max(...rows.map((x) => x.kg), 1)

  useEffect(() => {
    const sync = () => {
      const next = readLogs()
      const json = JSON.stringify(next)
      if (json === prevJson.current) return
      const old = prev.current
      prev.current = next
      prevJson.current = json
      setLogs(next)
      const known = new Set(old.map((l) => l.id))
      const added = next.filter((l) => !known.has(l.id))
      if (added.length !== 1) { setFlash(null); return }
      const a = added[0]
      const same = old.filter((l) => l.ex === a.ex)
      const heavy = same.reduce((m, l) => Math.max(m, l.kg), 0)
      const best = same.reduce((m, l) => Math.max(m, est1(l.kg, l.reps)), 0)
      const text = !same.length
        ? 'First lift logged'
        : a.kg > heavy
          ? `New PR +${Math.round((a.kg - heavy) * 10) / 10} kg`
          : est1(a.kg, a.reps) > best ? 'Strength PR' : 'Logged'
      setI(Math.max(topLifts(next).findIndex((x) => x.ex === a.ex), 0))
      setFlash({ text, ex: a.ex, kg: a.kg, reps: a.reps, key: Date.now() })
      hold.current = Date.now() + 7000
    }
    window.addEventListener('ironline-store', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('ironline-store', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() < hold.current) return
      setFlash(null)
      setI((x) => x + 1)
    }, 4200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!kg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(kg); return undefined }
    let raf
    const t0 = performance.now()
    const go = (t) => {
      const p = Math.min((t - t0) / 1200, 1)
      setN(Math.round(kg * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(go)
    }
    raf = requestAnimationFrame(go)
    return () => cancelAnimationFrame(raf)
  }, [kg, i, flash && flash.key])

  const badge = flash ? flash.text : `New PR${cur.up ? ` +${cur.up} kg` : ''}`
  const active = (x, idx) => (flash ? x.ex === flash.ex : idx === k)
  const act = flash ? Math.max(rows.findIndex((x) => x.ex === flash.ex), 0) : k

  useEffect(() => {
    const ul = listRef.current
    const li = ul && ul.children[act]
    if (li && ul.scrollHeight > ul.clientHeight) ul.scrollTo({ top: li.offsetTop - ul.offsetTop, behavior: 'smooth' })
  }, [act, rows.length])

  return (
    <div className="lf">
      <div className="lf-main">
        <span className="lf-badge" key={flash ? flash.key : i}>{badge}</span>
        <b>{n}<small>kg</small></b>
        <span className="lf-sub">{flash ? flash.ex : cur.ex} · {reps} {reps === 1 ? 'rep' : 'reps'}</span>
      </div>
      <ul ref={listRef} className={rows.length > 3 ? 'scroll' : ''}>
        {rows.map((x, idx) => (
          <li key={x.ex} className={active(x, idx) ? 'on' : ''}>
            <span>{x.ex}</span><strong>{x.kg ? `${x.kg} kg` : '—'}</strong>
            <div><i style={{ width: `${(x.kg / maxKg) * 100 * (active(x, idx) ? 1 : 0.3)}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const GROUP_SLUGS = {
  Chest: ['chest'],
  Shoulders: ['deltoids'],
  Back: ['upper-back', 'lower-back', 'trapezius'],
  Arms: ['biceps', 'triceps', 'forearm'],
  Core: ['abs', 'obliques'],
  Legs: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors', 'tibialis'],
}
const mapOrder = ['Chest', 'Shoulders', 'Back', 'Arms', 'Core', 'Legs']
const mapParts = {
  Back: ['M112 58 C108 66 98 71 84 76 C88 80 94 86 98 90 C104 84 110 76 112 68Z', 'M85 122 C90 128 94 130 98 136 C102 148 102 160 101 172 C96 168 90 150 85 122Z'],
  Shoulders: ['M84 76 C70 74 56 84 52 102 C50 112 54 122 60 126 C68 122 76 114 82 104 C88 94 92 88 98 90 C94 86 88 80 84 76Z'],
  Chest: ['M98 90 C106 88 114 90 119 94 L119 136 C110 142 98 138 92 126 C90 116 92 100 98 90Z'],
  Core: ['M112 141H112Q118 141 118 147V152Q118 158 112 158H112Q106 158 106 152V147Q106 141 112 141Z', 'M111 161H112Q118 161 118 167V171Q118 177 112 177H111Q105 177 105 171V167Q105 161 111 161Z', 'M111 181H112Q118 181 118 187V191Q118 197 112 197H111Q105 197 105 191V187Q105 181 111 181Z', 'M111 201H113Q118 201 118 206V208Q118 213 113 213H111Q106 213 106 208V206Q106 201 111 201Z', 'M101 174 C103 186 103 198 100 211 L94 208 C93 196 95 184 97 177Z', 'M99 142 C102 152 102 164 101 172 C97 168 96 152 99 142Z'],
  Arms: ['M58 126 C52 140 50 158 54 176 L66 178 C72 162 74 142 72 124 C68 126 62 127 58 126Z', 'M53 181 C48 195 44 215 42 237 L52 241 C58 223 64 201 67 183Z'],
  Legs: ['M94 230 C86 254 87 292 94 321 L117 321 C120 292 120 258 118 230Z', 'M97 336 C90 358 90 384 96 410 L108 410 C114 390 116 360 114 336Z'],
}
const mapDead = ['M95 211 C100 216 110 220 119 222 L119 234 C108 232 98 226 93 218Z', 'M42 241 C40 253 42 263 48 265 C54 263 56 251 54 243Z', 'M96 322 C100 329 112 329 117 322 L115 335 C109 339 102 339 98 335Z', 'M96 412 C92 420 94 427 102 428 L111 426 L109 412Z']
const mapDet = {
  Chest: ['M119 104 C110 106 102 112 96 122'],
  Shoulders: ['M64 100 C70 108 76 108 82 102'],
  Arms: ['M58 140 C62 150 62 160 60 170'],
  Legs: ['M102 246 C100 270 100 296 104 316', 'M104 350 C102 370 104 392 106 406'],
  Back: ['M91 140 C94 156 95 172 94 190'],
}
const torso = 'M112 66 C100 72 88 78 84 90 C82 104 84 118 86 126 C90 150 92 190 95 212 L119 218 L119 66Z'
const flip = 'translate(240 0) scale(-1 1)'

function LiftRack() {
  const groups = mapOrder.filter((g) => exercises[g])
  const [k, setK] = useState(0)
  const [view, setView] = useState(null)
  const hold = useRef(0)
  const stage = useRef(null)
  const [pin, setPin] = useState(null)
  // Keeps cycling forever; a tap or toggle only pauses it for a few seconds.
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - hold.current < 7000) return
      setView(null)
      setK((x) => (x + 1) % groups.length)
    }, 3600)
    return () => clearInterval(t)
  }, [groups.length])
  const g = groups[k]
  const list = exercises[g]
  const pick = (i) => { hold.current = Date.now(); setView(null); setK(i) }
  const flip = (v) => { hold.current = Date.now(); setView(v) }
  const side = view || (g === 'Back' ? 'back' : 'front')
  const bodyData = [
    ...['head', 'neck', 'hair', 'hands', 'feet', 'ankles', 'knees'].map((slug) => ({ slug, styles: { fill: '#16181c', stroke: 'rgb(216 185 131 / 22%)', strokeWidth: 0.6 } })),
    ...(GROUP_SLUGS[g] || []).map((slug) => ({ slug, intensity: 2 })),
  ]

  useEffect(() => {
    const measure = () => {
      const root = stage.current
      if (!root) return
      const lit = root.querySelectorAll('.rk-fig svg path[fill="#f6e4bd"]')
      if (!lit.length) { setPin(null); return }
      const box = root.getBoundingClientRect()
      let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9
      lit.forEach((p) => { const r = p.getBoundingClientRect(); x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom) })
      setPin({ x: (x1 + x2) / 2 - box.left, y: (y1 + y2) / 2 - box.top, right: x2 - box.left, w: box.width })
    }
    const t1 = setTimeout(measure, 60)
    const t2 = setTimeout(measure, 800)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure) }
  }, [k, side])

  return (
    <div className="rk">
      <small>Interactive · Tap a muscle</small>
      <div className="rk-stage" ref={stage}>
        <div className="rk-bodies" role="group" aria-label={`Muscle map, ${g} selected`}>
          <svg className="rk-defs" width="0" height="0" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="rkMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a4e57" /><stop offset=".45" stopColor="#2a2d33" /><stop offset="1" stopColor="#15171b" /></linearGradient>
              <linearGradient id="rkGoldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff4d6" /><stop offset=".5" stopColor="#e2c58f" /><stop offset="1" stopColor="#a7803f" /></linearGradient>
            </defs>
          </svg>
          <div className="rk-spot" aria-hidden="true" />
          <div className="rk-orbit" aria-hidden="true"><i /><i /></div>
          <div className="rk-scanline" aria-hidden="true" />
          <span className="rk-br tl" aria-hidden="true" /><span className="rk-br tr" aria-hidden="true" /><span className="rk-br bl" aria-hidden="true" /><span className="rk-br brr" aria-hidden="true" />
          <div className="rk-fig" key={side}>
            <Body
              data={bodyData}
              side={side}
              gender="male"
              scale={1.25}
              colors={['#caa76b', '#f6e4bd']}
              border="rgb(216 185 131 / 28%)"
              defaultFill="#1d2025"
              defaultStroke="rgb(216 185 131 / 30%)"
              defaultStrokeWidth={0.7}
              onBodyPartPress={(p) => { const i = groups.findIndex((n) => (GROUP_SLUGS[n] || []).includes(p.slug)); if (i >= 0) pick(i) }}
            />
          </div>
          {pin && (
            <div className="rk-pin" key={`${g}-${side}`} style={{ '--px': `${pin.x}px`, '--py': `${pin.y}px`, '--pr': `${pin.right}px`, '--pw': `${pin.w}px` }} aria-hidden="true">
              <b /><u /><em>{g}</em>
            </div>
          )}
          <div className="rk-flip" role="group" aria-label="Body view">
            {['front', 'back'].map((v) => (
              <button type="button" key={v} className={v === side ? 'on' : ''} aria-pressed={v === side} onClick={() => flip(v)}>{v}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="rk-info">
        <div className="rk-row"><h3 key={g}>{g}</h3><span className="rk-rep"><b>{list.length}</b> exercises</span></div>
        <p aria-live="polite">{list.slice(0, 3).map((x) => x.n).join(' · ')}</p>
      </div>
      <a href="#exercises" className="btn rk-cta">Browse {g.toLowerCase()} exercises <span aria-hidden="true">→</span></a>
    </div>
  )
}

function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button key={item} type="button" aria-pressed={value === item} onClick={() => onChange(item)}>{item}</button>
      ))}
    </div>
  )
}

const ICONS = {
  dumbbell: 'M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  apple: 'M12 7c-2-2-6-1.5-6 3 0 4 3 9 6 9s6-5 6-9c0-4.5-4-5-6-3zM12 7c0-2 1-4 3-5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3',
  chart: 'M3 3v18h18M7 15l4-4 3 3 5-6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  bag: 'M6 7h12l1 13H5zM9 7a3 3 0 0 1 6 0',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
}

function Icon({ n, cls }) {
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[n]} />
    </svg>
  )
}

function Figure({ ex }) {
  const fr = useMemo(() => frames(ex), [ex])
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const pts = (f) => ['W', 'E', 'N', 'P', 'K', 'A', 'F'].map((key) => f[key].join(',')).join(' ')
  const kt = fr.map((f) => f.kt.toFixed(4)).join(';')
  const rpts = (f) => ['P', 'K2', 'A2'].map((key) => f[key].join(',')).join(' ')
  const an = (attr, get) => (still ? null : <animate attributeName={attr} values={fr.map(get).join(';')} keyTimes={kt} dur={`${DUR}s`} repeatCount="indefinite" />)
  const dot = (key, r, cls) => (
    <circle className={cls} r={r} cx={fr[0][key][0]} cy={fr[0][key][1]}>
      {an('cx', (f) => f[key][0])}
      {an('cy', (f) => f[key][1])}
    </circle>
  )
  const mid = fr.find((f) => f.kt >= 1.1 / DUR) || fr[0]
  const tk = ex.q === 'ank' ? 'A' : 'W'
  const trail = fr.filter((_, i) => i % 2 === 0).map((f) => f[tk].join(',')).join(' ')

  return (
    <svg className="fig" viewBox={ex.v || '0 0 240 160'} role="img" aria-label={`${ex.n} animated demonstration`}>
      <path className="bg" d={ex.g} />
      <polyline className="ghost" points={pts(mid)} />
      {ex.q && <polyline className="trail" points={trail} />}
      {ex.q === 'cab' && (
        <>
          <line className="cab" x1={fr[0].W[0]} y1={fr[0].W[1]} x2={ex.c[0]} y2={ex.c[1]}>
            {an('x1', (f) => f.W[0])}
            {an('y1', (f) => f.W[1])}
          </line>
          <circle className="pul" cx={ex.c[0]} cy={ex.c[1]} r="5" />
          {dot('W', 4, 'eq')}
        </>
      )}
      {ex.q === 'bar' && dot('W', 13, 'eq')}
      {ex.q === 'db' && dot('W', 7, 'eq')}
      {ex.q === 'ank' && dot('A', 11, 'eq')}
      {fr[0].K2 && <polyline className="body rear" points={rpts(fr[0])}>{an('points', rpts)}</polyline>}
      <polyline className="body" points={pts(fr[0])}>{an('points', pts)}</polyline>
      {dot('H', 9, 'head')}
    </svg>
  )
}

function Library() {
  const groups = Object.keys(exercises)
  const [group, setGroup] = useState(groups[0])
  return (
    <>
      <Tabs items={groups} value={group} onChange={setGroup} label="Muscle group" />
      <div className="cards ex">
        {exercises[group].map((ex) => (
          <article className="ex-card" key={ex.n}>
            <div className="fig-wrap">
              <Figure ex={ex} />
              <span className="chip"><Icon n="dumbbell" />{ex.s}</span>
            </div>
            <h3>{ex.n}</h3>
            <p>{ex.t}</p>
          </article>
        ))}
      </div>
    </>
  )
}

const levels = [
  { id: 'Simple', coach: 'Aarav', role: 'Calm and beginner friendly', bolts: 1, n: 3, sets: 3, reps: '10–12', hold: 30, rest: 90, say: (f, n) => `Easy does it. Today is ${f}: ${n} moves with light weight and clean form. Breathe, enjoy it, and rest a full 90 seconds.` },
  { id: 'Hard', coach: 'Riya', role: 'Strict and sharp', bolts: 2, n: 4, sets: 4, reps: '8–10', hold: 45, rest: 60, say: (f, n) => `Let's work. ${f} day: ${n} exercises, 4 sets each, 60 seconds rest. Push every set hard and keep your form clean.` },
  { id: 'Very hard', coach: 'Vikram', role: 'Intense and demanding', bolts: 3, n: 4, sets: 5, reps: '6–8', hold: 60, rest: 45, finisher: true, say: (f, n) => `Time to push. ${f}: ${n} exercises, 5 heavy sets each, only 45 seconds rest, and a finisher at the end. Make it count.` },
]

const pickPlan = (lv, focus) => {
  const order = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core']
  if (focus === 'Full body') {
    const base = order.slice(0, lv.id === 'Simple' ? 4 : 6).map((g) => exercises[g][0])
    return lv.finisher ? [...base, exercises.Legs[1], exercises.Back[1]] : base
  }
  const list = exercises[focus].slice(0, lv.n)
  return lv.finisher && focus !== 'Core' ? [...list, exercises.Core[0]] : list
}

function Trainer() {
  const [levelId, setLevelId] = useState(levels[0].id)
  const [focus, setFocus] = useState('Full body')
  const [step, setStep] = useState(0)
  const lv = levels.find((level) => level.id === levelId)
  const list = pickPlan(lv, focus)
  const done = step >= list.length
  const ex = list[Math.min(step, list.length - 1)]
  const last = step === list.length - 1
  const volume = ex.s.endsWith('s') ? `${lv.sets} × ${lv.hold} s` : `${lv.sets} × ${lv.reps}`

  return (
    <>
      <div className="coaches" role="radiogroup" aria-label="Choose your trainer">
        {levels.map((level) => (
          <button key={level.id} type="button" className="coach" role="radio" aria-checked={levelId === level.id} onClick={() => { setLevelId(level.id); setStep(0) }}>
            <span className="coach-av">{level.coach[0]}</span>
            <span className="coach-info"><b>{level.coach}</b><small>{level.role}</small></span>
            <span className="level">{Array.from({ length: level.bolts }, (_, i) => <Icon key={i} n="bolt" />)}{level.id}</span>
          </button>
        ))}
      </div>
      <Tabs items={['Full body', ...Object.keys(exercises)]} value={focus} onChange={(value) => { setFocus(value); setStep(0) }} label="Workout focus" />
      <div className="plan card">
        <div className="say">
          <span className="coach-av sm">{lv.coach[0]}</span>
          <p><b>{lv.coach} says</b>{lv.say(focus, list.length)}</p>
        </div>
        {done ? (
          <div className="done">
            <h3>Workout <em>complete</em></h3>
            <p>{lv.coach}: great work today. Drink water, eat your protein, and come back stronger.</p>
            <button type="button" className="btn gold" onClick={() => setStep(0)}>Do it again</button>
          </div>
        ) : (
          <div className="stepper">
            <div className="fig-wrap"><Figure key={ex.n} ex={ex} /></div>
            <div className="step-info">
              <p className="eyebrow"><i aria-hidden="true" />Exercise {step + 1} of {list.length}{lv.finisher && focus !== 'Full body' && last && focus !== 'Core' ? ' · Finisher' : ''}</p>
              <h3>{ex.n}</h3>
              <ul className="facts"><li>{volume}</li><li>{lv.rest} s rest</li></ul>
              <p>{ex.t}</p>
              <div className="step-nav">
                <button type="button" className="btn ghost sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
                <button type="button" className="btn gold sm" onClick={() => setStep(step + 1)}>{last ? 'Finish' : 'Next exercise'}</button>
              </div>
            </div>
          </div>
        )}
        <div className="dots">
          {list.map((item, i) => <button key={item.n} type="button" aria-label={`Go to ${item.n}`} className={i === step ? 'on' : i < step ? 'past' : ''} onClick={() => setStep(i)} />)}
        </div>
      </div>
    </>
  )
}

function Plans() {
  const names = Object.keys(plans)
  const [plan, setPlan] = useState(names[0])
  return (
    <>
      <Tabs items={names} value={plan} onChange={setPlan} label="Workout plan" />
      <div className="cards">
        {plans[plan].map(([day, focus, list]) => (
          <div className="slot" key={day}>
            <span className="slot-time">{day}</span>
            <strong>{focus}</strong>
            <span className="slot-note">{list}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Reminders() {
  const saved = useRef(null)
  if (saved.current === null) saved.current = readReminderSettings()

  const [water, setWaterRaw] = useState(saved.current.water)
  const [meals, setMealsRaw] = useState(saved.current.meals)
  const [remUpdated, setRemUpdated] = useState(saved.current.remUpdated || 0)
  // Water and meal edits made on this device are time-stamped so the newest edit wins when devices sync.
  const setWater = (update) => { setWaterRaw(update); setRemUpdated(Date.now()) }
  const setMeals = (update) => { setMealsRaw(update); setRemUpdated(Date.now()) }
  const latestRem = useRef(null)
  const lastRemSynced = useRef(0)
  const [fee, setFeeRaw] = useState(saved.current.fee)
  // Every edit made on this device is stamped so the newest edit wins when devices sync.
  const setFee = (update) => setFeeRaw((current) => ({ ...withNext(typeof update === 'function' ? update(current) : update), updatedAt: Date.now() }))
  const user = useUser()
  const uid = user ? user.uid : ''
  const [syncStatus, setSyncStatus] = useState('idle')
  const [syncError, setSyncError] = useState('')
  const failSync = (error) => {
    console.error('Sync error:', error)
    setSyncError((error && (error.code || error.message)) || 'unknown error')
    setSyncStatus('error')
  }
  const [paidNote, setPaidNote] = useState('')
  const feeRef = useRef(fee)
  feeRef.current = fee
  latestRem.current = { water, meals, remUpdated }
  const lastSynced = useRef(0)
  const [storageError, setStorageError] = useState(saved.current.storageError)
  const [savedAt, setSavedAt] = useState(null)
  const [permission, setPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )
  const [toast, setToast] = useState(null)
  const [pushStatus, setPushStatus] = useState('off')
  const [pushToken, setPushToken] = useState(null)
  const fired = useRef({})
  const backgroundPushEnabled = useRef(false)
  backgroundPushEnabled.current = pushStatus === 'on'

  const notify = (title, body) => {
    if (backgroundPushEnabled.current && document.hidden) return
    setToast({ title, body })
    if (permission === 'granted' && typeof Notification !== 'undefined') {
      try {
        new Notification(title, { body })
      } catch {
        // Some mobile browsers only allow notifications through a service worker.
      }
    }
  }
  const liveNotify = useRef(notify)
  liveNotify.current = notify

  useEffect(() => {
    try {
      localStorage.setItem(REMINDER_KEY, JSON.stringify({ water, meals, fee, remUpdated }))
      setStorageError(false)
      setSavedAt(new Date())
    } catch {
      setStorageError(true)
    }
  }, [water, meals, fee, remUpdated])

  useEffect(() => {
    if (!water.on) return undefined
    const timer = window.setInterval(
      () => liveNotify.current('Time for water', 'Drink a glass of water now.'),
      water.mins * 60_000,
    )
    return () => window.clearInterval(timer)
  }, [water.on, water.mins])

  useEffect(() => {
    const checkMeals = () => {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const stamp = `${now.toDateString()}-${time}`
      meals.forEach((meal) => {
        if (meal.on && meal.time === time && fired.current[meal.id] !== stamp) {
          fired.current[meal.id] = stamp
          liveNotify.current(`${meal.label} reminder`, `It's ${meal.label.toLowerCase()} time. Eat your planned meal.`)
        }
      })
    }
    checkMeals()
    const timer = window.setInterval(checkMeals, 15_000)
    return () => window.clearInterval(timer)
  }, [meals])

  useEffect(() => {
    const checkFee = () => {
      if (!fee.on) return
      const now = new Date()
      const due = feeDueDate(fee)
      const sameDay = now.getFullYear() === due.getFullYear() && now.getMonth() === due.getMonth() && now.getDate() === due.getDate()
      const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
      const stamp = `${now.toDateString()}-${time}`
      if (sameDay && time === fee.time && fired.current.fee !== stamp) {
        fired.current.fee = stamp
        liveNotify.current('Gym fee due', `Your ${fee.plan}-month gym fee is due today. Pay it before you train.`)
      }
    }
    checkFee()
    const timer = window.setInterval(checkFee, 15_000)
    return () => window.clearInterval(timer)
  }, [fee])

  // Once signed in, every device reads and writes the same cloud copy. onSnapshot pushes a change to this
  // device the moment another device saves it, and the newest edit (updatedAt) wins.
  useEffect(() => {
    if (!uid) { setSyncStatus('idle'); return undefined }
    setSyncStatus('connecting')
    return watchUserData(uid, 'fee', (remote) => {
      setSyncStatus('on')
      if (!remote) { setFeeRaw((current) => ({ ...current, updatedAt: Date.now() })); return } // first sign-in: upload what this device has
      if ((remote.updatedAt || 0) > (feeRef.current.updatedAt || 0)) {
        lastSynced.current = remote.updatedAt
        setFeeRaw(withNext({ on: remote.on, plan: remote.plan, paidOn: remote.paidOn, time: remote.time, history: remote.history, updatedAt: remote.updatedAt }))
      }
    }, failSync)
  }, [uid])

  useEffect(() => {
    if (!uid || !fee.updatedAt || fee.updatedAt === lastSynced.current) return undefined
    const timer = window.setTimeout(() => {
      saveFee(uid, fee)
        .then(() => { lastSynced.current = fee.updatedAt; setSyncStatus('on') })
        .catch(failSync)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [uid, fee])

  useEffect(() => {
    if (!uid) return undefined
    return watchUserData(uid, 'reminders', (remote) => {
      const cur = latestRem.current
      const isDefault = !cur.water.on && cur.water.mins === 60 && JSON.stringify(cur.meals) === JSON.stringify(defaultMeals)
      const remoteOk = remote && isWater(remote.water) && isMeals(remote.meals)
      if (!remoteOk) {
        if (!isDefault || cur.remUpdated) setRemUpdated(Date.now())
      } else if (!cur.remUpdated && !isDefault) {
        setRemUpdated(Date.now()) // reminders set up here before signing in: keep them
      } else if ((remote.updatedAt || 0) > cur.remUpdated) {
        lastRemSynced.current = remote.updatedAt
        setWaterRaw(remote.water)
        setMealsRaw(remote.meals)
        setRemUpdated(remote.updatedAt)
      }
    }, failSync)
  }, [uid])

  useEffect(() => {
    if (!uid || !remUpdated || remUpdated === lastRemSynced.current) return undefined
    const timer = window.setTimeout(() => {
      saveReminders(uid, { water, meals, updatedAt: remUpdated })
        .then(() => { lastRemSynced.current = remUpdated })
        .catch(failSync)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [uid, remUpdated, water, meals])

  const markPaid = () => {
    const today = toDateStr(new Date())
    const entry = { paidOn: today, plan: fee.plan, nextDue: toDateStr(feeDueDate({ ...fee, paidOn: today })) }
    setFee((current) => ({
      ...current,
      paidOn: today,
      history: [entry, ...(current.history || []).filter((item) => item.paidOn !== today)].slice(0, 6),
    }))
    setPaidNote(`Payment saved. Next payment: ${showDate(entry.nextDue)}`)
  }

  const signInToSync = async () => {
    setSyncStatus('connecting')
    try {
      await signInWithGoogle()
    } catch (error) {
      if (error && error.code === 'auth/popup-closed-by-user') setSyncStatus('idle')
      else failSync(error)
    }
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 9000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (permission !== 'granted') return undefined
    let cancelled = false
    registerPush()
      .then((token) => {
        if (!cancelled) setPushToken(token)
      })
      .catch(() => {
        if (!cancelled) setPushStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [permission])

  useEffect(() => {
    if (!pushToken) return undefined
    let cancelled = false
    const timer = window.setTimeout(() => {
      saveSubscription(pushToken, water, meals, fee)
        .then(() => {
          if (!cancelled) setPushStatus('on')
        })
        .catch(() => {
          if (!cancelled) setPushStatus('error')
        })
    }, 600)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [pushToken, water, meals, fee])

  const enableNotifications = async () => {
    try {
      setPermission(await Notification.requestPermission())
    } catch {
      setPushStatus('error')
    }
  }

  const updateMeal = (id, patch) => {
    setMeals((currentMeals) => currentMeals.map((meal) => (
      meal.id === id ? { ...meal, ...patch } : meal
    )))
  }

  return (
    <>
      <div className="rem">
        <div className="rem-intro">
          <p className="eyebrow"><i aria-hidden="true" />Good habits, built in</p>
          <h2>Stay <em>on plan</em></h2>
          <p className="lead">Set water, meal and gym fee reminders. Turn on notifications and we'll send them to your device even when this site is closed.</p>
          {permission === 'default' && <button className="btn gold" onClick={enableNotifications}>Turn on notifications</button>}
          {permission === 'granted' && <p className="note">Browser notifications are on.</p>}
          {permission === 'denied' && <p className="note">Notifications are blocked. Allow them in your browser&apos;s site settings, or rely on on-page alerts.</p>}
          {permission === 'unsupported' && <p className="note">This browser does not support notifications. On-page reminders remain available.</p>}
          {pushStatus === 'on' && <p className="note">Background reminders are connected.</p>}
          {pushStatus === 'error' && <p className="note" role="status">Background reminders are unavailable. Check your Firebase and web-push configuration; on-page reminders remain available.</p>}
          {storageError && <p className="note" role="status">Reminder settings could not be saved in this browser.</p>}
          <button className="btn ghost reminder-test" onClick={() => notify('Test reminder', 'This is how your reminders will look.')}>Send a test reminder</button>
        </div>
        <div className="rem-settings">
          <div className="rem-card">
            <div className="rem-head">
              <h3>Water</h3>
              <button
                className="switch"
                type="button"
                role="switch"
                aria-checked={water.on}
                aria-label="Water reminders"
                onClick={() => setWater((current) => ({ ...current, on: !current.on, since: Date.now() }))}
              />
            </div>
            <label>
              Remind me every
              <select value={water.mins} onChange={(event) => setWater((current) => ({ ...current, mins: Number(event.target.value), since: Date.now() }))}>
                {[30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
              </select>
            </label>
          </div>
          <div className="rem-card">
            <div className="rem-head"><h3>Meals</h3></div>
            {meals.map((meal) => (
              <div className="meal" key={meal.id}>
                <span>{meal.label}</span>
                <input type="time" aria-label={`${meal.label} time`} value={meal.time} onChange={(event) => updateMeal(meal.id, { time: event.target.value })} />
                <button
                  className="switch"
                  type="button"
                  role="switch"
                  aria-checked={meal.on}
                  aria-label={`${meal.label} reminder`}
                  onClick={() => updateMeal(meal.id, { on: !meal.on })}
                />
              </div>
            ))}
            <p className="note">Each meal reminder fires once a day at the time you set.</p>
          </div>
          <div className="rem-card">
            <div className="rem-head">
              <h3>Gym fee</h3>
              <button
                className="switch"
                type="button"
                role="switch"
                aria-checked={fee.on}
                aria-label="Gym fee reminder"
                onClick={() => setFee((current) => ({ ...current, on: !current.on }))}
              />
            </div>
            <label>
              Plan you paid for
              <select value={fee.plan} onChange={(event) => setFee((current) => ({ ...current, plan: Number(event.target.value) }))}>
                {FEE_PLANS.map((n) => <option key={n} value={n}>{n === 1 ? '1 month' : `${n} months`}</option>)}
              </select>
            </label>
            <div className="meal">
              <span>Paid on</span>
              <input type="date" aria-label="Date you paid" value={fee.paidOn} max={toDateStr(new Date())} onChange={(event) => event.target.value && setFee((current) => ({ ...current, paidOn: event.target.value }))} />
            </div>
            <div className="meal">
              <span>Reminder time</span>
              <input type="time" aria-label="Gym fee reminder time" value={fee.time} onChange={(event) => setFee((current) => ({ ...current, time: event.target.value }))} />
            </div>
            {(() => {
              const due = feeDueDate(fee)
              const days = Math.ceil((due - new Date()) / 86_400_000)
              const dateText = due.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
              return (
                <p className={`fee-next${days < 0 ? ' late' : ''}`}>
                  {days < 0 ? 'Payment overdue since ' : 'Next payment: '}<strong>{dateText}</strong>
                  {days >= 0 && ` (${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`})`}
                </p>
              )
            })()}
            <button className="btn ghost" type="button" onClick={markPaid}>I paid today</button>
            {paidNote && <p className="fee-saved" role="status">{paidNote}</p>}
            {fee.history.length > 0 && (
              <ul className="fee-history" aria-label="Payment history">
                {fee.history.map((item) => (
                  <li key={item.paidOn}><span>Paid {showDate(item.paidOn)} · {item.plan === 1 ? '1 month' : `${item.plan} months`}</span><strong>Next: {showDate(item.nextDue)}</strong></li>
                ))}
              </ul>
            )}
            <p className="fee-saved" role="status">
              {storageError
                ? 'Could not save on this device. Private browsing blocks saving.'
                : `Payment info saved on this device${savedAt ? ` at ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}.`}
            </p>
            <div className="fee-sync">
              <h4>Sync across devices</h4>
              <p className="note">Sign in with Google and your gym fee, PR records, and water and meal reminders save automatically and appear on every device you sign in on.</p>
              {user ? (
                <>
                  <p className="note">Signed in as {user.email || user.displayName}. Changes sync automatically.</p>
                  <div className="sync-actions">
                    <button className="btn ghost" type="button" onClick={signOutUser}>Sign out</button>
                  </div>
                </>
              ) : (
                <button className="btn gold" type="button" onClick={signInToSync} disabled={syncStatus === 'connecting'}>Sign in with Google to sync</button>
              )}
              {syncStatus === 'on' && <p className="fee-saved" role="status">Synced across your devices.</p>}
              {syncStatus === 'error' && <p className="note" role="status">Sync is unavailable right now ({syncError}). Your info is still saved on this device.</p>}
            </div>
            <p className="note">You paid for {fee.plan === 1 ? '1 month' : `${fee.plan} months`}, so the next payment is {fee.plan === 1 ? '1 month' : `${fee.plan} months`} after the date you paid. Tap "I paid today" after each payment to move it forward.</p>
          </div>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <strong>{toast.title}</strong>
          {toast.body}
          <button onClick={() => setToast(null)}>Dismiss</button>
        </div>
      )}
    </>
  )
}

// Each page load picks a different available clip at random.
const HERO_VIDEO_ON_MOBILE = true
const HERO_VIDEOS = [
  { webm: '/hero/gym-1.webm', poster: '/hero/gym-poster-1.jpg' },
  { webm: '/hero/gym.webm', poster: '/hero/gym-poster.jpg' },
  { webm: '/hero/gym-3.webm', poster: '/hero/gym-poster-3.jpg' },
]

function HeroMedia() {
  const [heroVideo] = useState(() => HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)])
  const [videoFailed, setVideoFailed] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const calm = typeof window !== 'undefined' && (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    || navigator.connection?.saveData
    || (!HERO_VIDEO_ON_MOBILE && window.matchMedia?.('(max-width: 700px)').matches)
  )

  return (
    <div className="hero-media" aria-hidden="true">
      {!posterFailed && <img className="hero-img" src={heroVideo.poster} alt="" fetchPriority="high" decoding="async" onError={() => setPosterFailed(true)} />}
      {!calm && !videoFailed && (
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={heroVideo.poster} disablePictureInPicture disableRemotePlayback onError={() => setVideoFailed(true)}>
          <source src={heroVideo.webm} type="video/webm" />
        </video>
      )}
      <div className="hero-shade" />
    </div>
  )
}

// Tracks which page section is under the middle of the screen, so the phone tab bar can highlight it.
const SECTION_IDS = ['trainer', 'exercises', 'goals', 'plans', 'gear', 'avoid', 'records', 'reminders']
function useActiveSection() {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
      if (window.scrollY < 300) setActive('')
    }, { rootMargin: '-45% 0px -50% 0px' })
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  return active
}

function useStoredGoal() {
  const [goal, setGoal] = useState(() => {
    try {
      const saved = localStorage.getItem('ironline-goal')
      return goalNames.includes(saved) ? saved : goalNames[0]
    } catch {
      return goalNames[0]
    }
  })
  const update = (next) => {
    setGoal(next)
    try {
      localStorage.setItem('ironline-goal', next)
    } catch {
      // Ignore blocked storage.
    }
  }
  return [goal, update]
}

function Accordion({ items }) {
  const [open, setOpen] = useState(0)

  return (
    <div className="rows">
      {items.map((program, index) => {
        const isOpen = open === index
        return (
          <div className={`row${isOpen ? ' open' : ''}`} key={program.name}>
            <button
              aria-expanded={isOpen}
              aria-controls={`program-panel-${index}`}
              onClick={() => setOpen(isOpen ? -1 : index)}
            >
              <span className="row-num">0{index + 1}</span>
              <span className="row-title">{program.name}</span>
              <span className="plus" aria-hidden="true" />
            </button>
            <div className="more" id={`program-panel-${index}`} aria-hidden={!isOpen}>
              <p>{program.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [goal, setGoal] = useStoredGoal()
  const [searchOpen, setSearchOpen] = useState(false)
  const [gearTab, setGearTab] = useState('Wearables')
  const activeSection = useActiveSection()
  const rootRef = useRef(null)
  useReveal()
  useScrollState(rootRef)
  usePointerGlow()
  useEffect(() => {
    const onKey = (event) => {
      const el = event.target
      const typing = el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      } else if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    const onDown = (event) => { if (!event.target.closest?.('.nav-pill')) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [menuOpen])
  const closeMenu = () => setMenuOpen(false)
  const head = (tag, title, em, lead) => (
    <div className="sec-head">
      <p className="eyebrow"><i aria-hidden="true" />{tag}</p>
      {(title || em) && <h2>{title} <em>{em}</em></h2>}
      <p className="lead">{lead}</p>
    </div>
  )

  return (
    <div className="gym" ref={rootRef}>
      <div className="progress" aria-hidden="true" />
      <div className="aura" aria-hidden="true" />
      <nav className="site-nav" aria-label="Main navigation">
        <div className="nav-pill">
          <a href="#top" className="logo" onClick={closeMenu}><Icon n="dumbbell" />{BRAND}</a>
          <div className={`links${menuOpen ? ' is-open' : ''}`} id="site-links">
            <a href="#trainer" onClick={closeMenu}>Trainer</a>
            <a href="#exercises" onClick={closeMenu}>Exercises</a>
            <a href="#goals" onClick={closeMenu}>Goals</a>
            <a href="#gear" onClick={closeMenu}>Gear</a>
            <a className="only-menu" href="#records" onClick={closeMenu}>PRs</a>
            <a className="only-menu" href="#plans" onClick={closeMenu}>Workout plans</a>
            <a className="only-menu" href="#avoid" onClick={closeMenu}>What to avoid</a>
            <a className="only-menu" href="#reminders" onClick={closeMenu}>Reminders</a>
            <a className="only-menu" href="#faq" onClick={closeMenu}>FAQ</a>
          </div>
          <button type="button" className="nav-search" onClick={() => { closeMenu(); setSearchOpen(true) }} aria-label="Search (press slash)" aria-haspopup="dialog"><Icon n="search" /><span>Search</span><kbd aria-hidden="true">/</kbd></button>
          <a href="#trainer" className="btn gold sm nav-cta" onClick={closeMenu}>Start training</a>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-links" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen((isOpen) => !isOpen)}>
            <span />
            <span />
          </button>
        </div>
      </nav>

      <header className="hx" id="top">
        <div className="hx-grid">
          <div className="hx-t hx-head">
            <p className="hx-tag"><span aria-hidden="true" />Gym training guide<b>Free · Always</b></p>
            <div className="hx-hl">
              <div className="hx-seal" aria-hidden="true">
                <svg viewBox="0 0 120 120"><defs><path id="hxSealPath" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs><text><textPath href="#hxSealPath" textLength="280" lengthAdjust="spacing">TRAIN HARD · EAT RIGHT · REPEAT · </textPath></text></svg>
                <span><Icon n="dumbbell" /></span>
              </div>
              <h1 className="hx-title"><span>Train hard.</span><em>Eat right.</em></h1>
              <p className="hx-copy">Animated exercise guides, workout plans, diet plans and calculators for everyone who lifts.</p>
            </div>
            <Lifts />
            <div className="hx-cta">
              <a href="#trainer" className="btn gold">Choose your trainer</a>
              <a href="#exercises" className="btn ghost">Browse exercises</a>
            </div>
            <HeroPulse />
          </div>
          <div className="hx-t hx-vid">
            <HeroMedia />
            <span className="hx-idx">01 — Move</span>
            <span className="hx-chip"><i aria-hidden="true" />Animated form guides</span>
          </div>
          <dl className="hx-t hx-stats">
            <div><dt><CountUp to={Object.values(exercises).flat().length} /></dt><dd>Exercises</dd></div>
            <div><dt><CountUp to={Object.keys(plans).length} /></dt><dd>Workout plans</dd></div>
            <div><dt><CountUp to={Object.keys(diets).length} /></dt><dd>Diet plans</dd></div>
          </dl>
          <div className="hx-t hx-bar"><LiftRack /></div>
        </div>
      </header>


      <section className="amen" aria-label="What you get">
        <div className="wrap">
          {[
            ['user', 'trainer', 'Your trainer', 'Pick simple, hard or very hard and follow along.'],
            ['dumbbell', 'exercises', 'Exercise library', 'Animated demos with sets, reps and form cues.'],
            ['calendar', 'plans', 'Workout plans', 'Full body, push pull legs and upper lower.'],
            ['trophy', 'records', 'PR tracker', 'Log lifts, beat your best and track progress.'],
          ].map(([icon, id, title, text], i) => (
            <div key={id}><span className="n" aria-hidden="true">0{i + 1}</span><span className="ic"><Icon n={icon} /></span><h3><a href={`#${id}`}>{title}</a></h3><p>{text}</p></div>
          ))}
        </div>
      </section>

      <section id="trainer">
        <div className="wrap">
          {head('Your trainer', 'Choose your', 'trainer', 'Pick a coach and a focus. Your trainer builds today\'s workout and walks you through it, one exercise at a time.')}
          <Trainer />
        </div>
      </section>

      <section id="exercises">
        <div className="wrap">
          {head('Exercise library', 'Learn every', 'lift', 'Pick a muscle group. Each exercise shows sets, reps and one cue that fixes most form mistakes.')}
          <Library />
        </div>
      </section>

      <section id="goals">
        <div className="wrap">
          {head('Your goal', 'Pick your', 'goal', 'Get in shape, get lean, build muscle or lose weight. Every goal comes with its own exercise week and diet plan.')}
          <GoalPlans goal={goal} setGoal={setGoal} />
        </div>
      </section>

      <section id="plans" className="alt">
        <div className="wrap">
          {head('Workout plans', 'Follow a', 'plan', 'Choose the split that fits your week. Add weight whenever you hit the top of the rep range.')}
          <Plans />
        </div>
      </section>

      <section id="gear">
        <div className="wrap">
          {head('Gear up', 'Everything you', 'need', 'Supplements, wearables, equipment, shoes, perfume and your gym bag. What you really need, what is nice to have, and what to skip.')}
          <Checklist onGear={setGearTab} />
          <Gear tab={gearTab} setTab={setGearTab} />
        </div>
      </section>

      <section id="avoid" className="alt">
        <div className="wrap">
          {head('Do and don\'t', 'Avoid these', 'mistakes', 'What not to do before and after a workout, and what to do instead.')}
          <Avoid />
        </div>
      </section>

      <section id="records">
        <div className="wrap">
          {head('Personal records', 'Track your', 'PRs', 'Log every heavy set. We find your best lift, estimate your one rep max and show how far you are from your goal max.')}
          <PRTracker />
        </div>
      </section>

      <section id="reminders">
        <div className="wrap"><Reminders /></div>
      </section>

      <section id="faq">
        <div className="wrap split">
          {head('FAQ', 'Quick', 'answers', 'The basics, answered.')}
          <Accordion items={faqs} />
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div><strong>{BRAND}</strong><br />Free training, exercise and diet guides.</div>
          <div>Check with a doctor before starting<br />a new training or diet program.</div>
        </div>
        <div className="wordmark" aria-hidden="true">{BRAND}</div>
      </footer>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onGear={setGearTab} Figure={Figure} />}
      <nav className="tabbar" aria-label="Quick navigation">
        {[['user', 'trainer', 'Train', ['trainer', 'exercises', 'plans']], ['calendar', 'goals', 'Goals', ['goals']], ['trophy', 'records', 'Track', ['records', 'reminders']], ['bag', 'gear', 'Gear', ['gear', 'avoid']]].map(([icon, id, label, group]) => (
          <a key={id} href={`#${id}`} aria-current={group.includes(activeSection) ? 'true' : undefined}><Icon n={icon} /><span>{label}</span></a>
        ))}
        <button type="button" onClick={() => setSearchOpen(true)} aria-haspopup="dialog"><Icon n="search" /><span>Search</span></button>
      </nav>
    </div>
  )
}
