import { useEffect, useMemo, useRef, useState } from 'react'
import { registerPush, saveSubscription, saveFee, saveReminders, watchUserData, useUser, signInWithGoogle, signOutUser } from './push'
import { exercises, frames, DUR } from './exercises'
import { goalNames } from './goals'
import { GoalPlans, PRTracker } from './Tracking'
import SearchModal from './Search'
import { Checklist, Gear, Avoid } from './Gear'
import './App.css'

const BRAND = 'Ironline'
const REMINDER_KEY = 'ironline-reminders'

const goals = goalNames

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
  { name: 'Is it really free?', text: 'Yes. Every exercise guide, workout plan, diet plan and calculator is free, with no sign-up needed and no hidden fees.' },
  { name: 'How many days should I train?', text: 'Beginners do well with 3 full body days. Add a fourth or fifth day only when you recover well and your lifts keep going up.' },
  { name: 'How much protein do I need?', text: 'Aim for 1.6 to 2.2 g per kg of bodyweight a day. The calculator below works out your exact number.' },
  { name: 'Should I check with a doctor first?', text: 'If you have an injury, a health condition or have not trained in years, speak to a doctor or qualified trainer before starting.' },
]

const plates = { 5: [64, 0.55], 10: [92, 0.75], 15: [120, 0.9], 20: [150, 1] }
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

function Barbell() {
  const [load, setLoad] = useState([])
  const total = 20 + 2 * load.reduce((sum, weight) => sum + weight, 0)
  const addPlate = (weight) => {
    if (load.length < 5) setLoad([...load, weight])
  }
  const label = total <= 20
    ? 'Empty bar. Add some plates.'
    : total < 80
      ? 'Solid warm-up.'
      : total < 140
        ? "Now we're training."
        : 'Heavy. Chalk up.'

  return (
    <div className="rack">
      <small>Interactive · Load the bar</small>
      <svg viewBox="0 0 520 190" role="img" aria-label={`Barbell loaded to ${total} kilograms`}>
        <defs><linearGradient id="steel" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e8e6e1"/><stop offset="1" stopColor="#6c6f75"/></linearGradient><linearGradient id="gold" x1="0" x2="1"><stop offset="0" stopColor="#ecd3a5"/><stop offset="1" stopColor="#b08d57"/></linearGradient></defs>
        <rect x="10" y="92" width="500" height="8" fill="url(#steel)" />
        <rect x="200" y="86" width="120" height="20" fill="#3a3d42" />
        {load.map((weight, index) => {
          const [height, opacity] = plates[weight]
          return (
            <g key={`${weight}-${index}`}>
              <rect className="plate" x={190 - (index + 1) * 22} y={96 - height / 2} width="18" height={height} fill="url(#gold)" fillOpacity={opacity} stroke="#f1ede6" strokeOpacity=".25" />
              <rect className="plate" x={330 + index * 22} y={96 - height / 2} width="18" height={height} fill="url(#gold)" fillOpacity={opacity} stroke="#f1ede6" strokeOpacity=".25" />
            </g>
          )
        })}
      </svg>
      <div className="total" aria-live="polite">{total} kg</div>
      <p className="rack-label">{label}</p>
      <div className="plates">
        {[5, 10, 15, 20].map((weight) => (
          <button key={weight} onClick={() => addPlate(weight)} disabled={load.length >= 5}>Add {weight} kg</button>
        ))}
        <button onClick={() => setLoad(load.slice(0, -1))} disabled={!load.length}>Undo</button>
        <button onClick={() => setLoad([])} disabled={!load.length}>Clear</button>
      </div>
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
  { id: 'Hard', coach: 'Riya', role: 'Strict and sharp', bolts: 2, n: 4, sets: 4, reps: '8–10', hold: 45, rest: 60, say: (f, n) => `Let's work. ${f} day: ${n} exercises, 4 sets each, 60 seconds rest. Take every set close to failure.` },
  { id: 'Very hard', coach: 'Vikram', role: 'No excuses, no mercy', bolts: 3, n: 4, sets: 5, reps: '6–8', hold: 60, rest: 45, finisher: true, say: (f, n) => `No excuses. ${f}: ${n} exercises, 5 heavy sets each, only 45 seconds rest, and a finisher at the end. Earn it.` },
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

function Join() {
  const [interest, setInterest] = useState(goals[0])
  const [form, setForm] = useState({ name: '', email: '' })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    if (form.name.trim().length < 2) return setError('Enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address.')
    setError('')
    setSubmitted(true)
  }

  return (
    <div className="join">
      <div>
        <p className="eyebrow"><i aria-hidden="true" />Get started</p>
        <h2>Get your free plan. <em>Start this week.</em></h2>
        <p className="lead">Everything here is free. Tell us your goal and we will email you a starter workout and diet plan.</p>
      </div>
      {submitted ? (
        <div className="ok" role="status">
          <h3>Thanks, {form.name.trim().split(/\s+/)[0]}.</h3>
          <p>Your request is ready, but this demo does not send bookings yet. Email <a href={`mailto:hello@ironline.example?subject=${encodeURIComponent('Free starter plan')}&body=${encodeURIComponent(`Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\nInterest: ${interest}`)}`}>hello@ironline.example</a> to get your {interest} starter plan.</p>
        </div>
      ) : (
        <form className="card" onSubmit={submit} noValidate>
          <label>
            Full name
            <input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
          </label>
          <label>
            Your goal
            <select value={interest} onChange={(event) => setInterest(event.target.value)}>
              {goals.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn gold" type="submit">Get free plan</button>
        </form>
      )}
    </div>
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
    }, () => setSyncStatus('error'))
  }, [uid])

  useEffect(() => {
    if (!uid || !fee.updatedAt || fee.updatedAt === lastSynced.current) return undefined
    const timer = window.setTimeout(() => {
      saveFee(uid, fee)
        .then(() => { lastSynced.current = fee.updatedAt; setSyncStatus('on') })
        .catch(() => setSyncStatus('error'))
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
    }, () => setSyncStatus('error'))
  }, [uid])

  useEffect(() => {
    if (!uid || !remUpdated || remUpdated === lastRemSynced.current) return undefined
    const timer = window.setTimeout(() => {
      saveReminders(uid, { water, meals, updatedAt: remUpdated })
        .then(() => { lastRemSynced.current = remUpdated })
        .catch(() => setSyncStatus('error'))
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
      setSyncStatus(error && error.code === 'auth/popup-closed-by-user' ? 'idle' : 'error')
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
              {syncStatus === 'error' && <p className="note" role="status">Sync is unavailable right now. Your info is still saved on this device.</p>}
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
  const closeMenu = () => setMenuOpen(false)
  const head = (tag, title, em, lead) => (
    <div className="sec-head">
      <p className="eyebrow"><i aria-hidden="true" />{tag}</p>
      {(title || em) && <h2>{title} <em>{em}</em></h2>}
      <p className="lead">{lead}</p>
    </div>
  )

  return (
    <div className="gym">
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
          <a href="#join" className="btn gold sm nav-cta" onClick={closeMenu}>Start free</a>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-links" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen((isOpen) => !isOpen)}>
            <span />
            <span />
          </button>
        </div>
      </nav>

      <header className="hero" id="top">
        <HeroMedia />
        <Icon n="dumbbell" cls="hero-ic" />
        <div className="wrap">
          <div className="hero-content">
            <p className="eyebrow"><i aria-hidden="true" />Free gym training platform</p>
            <h1>Train hard.<br /><em>Eat right.</em></h1>
            <p className="hero-copy">Animated exercise guides, workout plans, diet plans and calculators for everyone who lifts. Free, always.</p>
            <div className="actions">
              <a href="#trainer" className="btn gold">Choose your trainer</a>
              <a href="#exercises" className="btn ghost">Browse exercises</a>
            </div>
            <button type="button" className="hero-search" onClick={() => setSearchOpen(true)} aria-haspopup="dialog">
              <Icon n="search" /><span>Search exercises, muscles, foods, supplements…</span><kbd aria-hidden="true">/</kbd>
            </button>
          </div>
          <Barbell />
        </div>
        <div className="wrap hero-foot">
          <dl className="stats">
            <div><dt>{Object.values(exercises).flat().length}</dt><dd>Exercises</dd></div>
            <div><dt>{Object.keys(plans).length}</dt><dd>Workout plans</dd></div>
            <div><dt>{Object.keys(diets).length}</dt><dd>Diet plans</dd></div>
            <div><dt>Free</dt><dd>Always</dd></div>
          </dl>
          <a href="#trainer" className="scroll-cue" aria-label="Scroll to your trainer"><span>Scroll</span><i aria-hidden="true" /></a>
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

      <section id="free" className="alt">
        <div className="wrap">
          <div className="free-card">
            <div>
              <p className="eyebrow"><i aria-hidden="true" />Always free</p>
              <h2>Free to use.<br /><em>Free forever.</em></h2>
              <p className="lead">No joining fee, no subscription, no ads. Pick a goal and start training.</p>
              <a href="#join" className="btn gold">Get free plan</a>
            </div>
            <ul className="perks">
              {['Full exercise library', 'Workout plans for every level', 'Diet plans and macro calculator', 'Water and meal reminders'].map((perk) => <li key={perk}>{perk}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="join">
        <div className="wrap"><Join /></div>
      </section>

      <footer>
        <div className="wrap">
          <div><strong>{BRAND}</strong><br />Free training, exercise and diet guides.</div>
          <div>Check with a doctor before starting<br />a new training or diet program.</div>
          <div><a href="mailto:hello@ironline.example">hello@ironline.example</a></div>
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
