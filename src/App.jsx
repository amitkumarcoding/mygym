import { useEffect, useMemo, useRef, useState } from 'react'
import { registerPush, saveSubscription } from './push'
import { exercises, frames, DUR } from './exercises'
import './App.css'

const BRAND = 'Ironline'
const REMINDER_KEY = 'ironline-reminders'

const goals = ['Muscle gain', 'Fat loss', 'Beginner basics', 'Strength']

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

function readReminderSettings() {
  const defaults = { water: { on: false, mins: 60, since: Date.now() }, meals: defaultMeals }

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

const activity = [[1.2, 'Little or no exercise'], [1.375, 'Light, 1–3 days a week'], [1.55, 'Moderate, 3–5 days a week'], [1.725, 'Hard, 6–7 days a week']]
const aims = [[300, 'Build muscle'], [-400, 'Lose fat'], [0, 'Maintain weight']]

function Calc() {
  const [f, setF] = useState({ sex: 'male', age: 25, weight: 70, height: 170, act: 1.55, goal: 300 })
  const n = (key) => Number(f[key])
  const set = (key) => (event) => setF({ ...f, [key]: event.target.value })
  const ok = n('age') > 0 && n('weight') > 0 && n('height') > 0
  const bmr = 10 * n('weight') + 6.25 * n('height') - 5 * n('age') + (f.sex === 'male' ? 5 : -161)
  const kcal = Math.max(0, Math.round(bmr * n('act') + n('goal')))
  const protein = Math.round(2 * n('weight'))
  const fat = Math.round((kcal * 0.25) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  const bmi = (n('weight') / (n('height') / 100) ** 2).toFixed(1)

  return (
    <div className="calc card">
      <h3>Calorie and macro calculator</h3>
      <div className="calc-grid">
        <label>Sex<select value={f.sex} onChange={set('sex')}><option value="male">Male</option><option value="female">Female</option></select></label>
        <label>Age<input type="number" min="12" value={f.age} onChange={set('age')} /></label>
        <label>Weight (kg)<input type="number" min="20" value={f.weight} onChange={set('weight')} /></label>
        <label>Height (cm)<input type="number" min="100" value={f.height} onChange={set('height')} /></label>
        <label>Activity<select value={f.act} onChange={set('act')}>{activity.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
        <label>Goal<select value={f.goal} onChange={set('goal')}>{aims.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
      </div>
      {ok ? (
        <div className="results" aria-live="polite">
          <div><b>{kcal}</b><span>kcal / day</span></div>
          <div><b>{protein} g</b><span>Protein</span></div>
          <div><b>{carbs} g</b><span>Carbs</span></div>
          <div><b>{fat} g</b><span>Fat</span></div>
          <div><b>{bmi}</b><span>BMI</span></div>
        </div>
      ) : <p className="err">Enter valid numbers.</p>}
      <p className="note">Estimates only (Mifflin-St Jeor). Adjust after 2 to 3 weeks based on your progress.</p>
    </div>
  )
}

function Diet() {
  const names = Object.keys(diets)
  const [diet, setDiet] = useState(names[0])
  return (
    <>
      <Tabs items={names} value={diet} onChange={setDiet} label="Diet goal" />
      <p className="diet-note">{diets[diet].note}</p>
      <div className="cards">
        {diets[diet].meals.map(([meal, food]) => (
          <div className="slot" key={meal}>
            <span className="slot-time">{meal}</span>
            <strong>{food}</strong>
          </div>
        ))}
      </div>
      <Calc />
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

  const [water, setWater] = useState(saved.current.water)
  const [meals, setMeals] = useState(saved.current.meals)
  const [storageError, setStorageError] = useState(saved.current.storageError)
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
      localStorage.setItem(REMINDER_KEY, JSON.stringify({ water, meals }))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [water, meals])

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
      saveSubscription(pushToken, water, meals)
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
  }, [pushToken, water, meals])

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
          <p className="lead">Set water and meal reminders. Turn on notifications and we'll send them to your device even when this site is closed.</p>
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
  const closeMenu = () => setMenuOpen(false)
  const head = (tag, title, em, lead) => (
    <div className="sec-head">
      <p className="eyebrow"><i aria-hidden="true" />{tag}</p>
      <h2>{title} <em>{em}</em></h2>
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
            <a href="#plans" onClick={closeMenu}>Plans</a>
            <a href="#diet" onClick={closeMenu}>Diet</a>
            <a href="#reminders" onClick={closeMenu}>Reminders</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
          </div>
          <a href="#join" className="btn gold sm nav-cta" onClick={closeMenu}>Free plan</a>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-links" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen((isOpen) => !isOpen)}>
            <span />
            <span />
          </button>
        </div>
      </nav>

      <header className="hero" id="top">
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
            <dl className="stats">
              <div><dt>{Object.values(exercises).flat().length}</dt><dd>Exercises</dd></div>
              <div><dt>{Object.keys(plans).length}</dt><dd>Workout plans</dd></div>
              <div><dt>{Object.keys(diets).length}</dt><dd>Diet plans</dd></div>
            </dl>
          </div>
          <Barbell />
        </div>
      </header>

      <section className="amen" aria-label="What you get">
        <div className="wrap">
          {[
            ['user', 'trainer', 'Your trainer', 'Pick simple, hard or very hard and follow along.'],
            ['dumbbell', 'exercises', 'Exercise library', 'Animated demos with sets, reps and form cues.'],
            ['calendar', 'plans', 'Workout plans', 'Full body, push pull legs and upper lower.'],
            ['apple', 'diet', 'Diet and macros', 'Meal plans plus a calorie calculator.'],
          ].map(([icon, id, title, text]) => (
            <div key={id}><span className="ic"><Icon n={icon} /></span><h3><a href={`#${id}`}>{title}</a></h3><p>{text}</p></div>
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

      <section id="plans" className="alt">
        <div className="wrap">
          {head('Workout plans', 'Follow a', 'plan', 'Choose the split that fits your week. Add weight whenever you hit the top of the rep range.')}
          <Plans />
        </div>
      </section>

      <section id="diet">
        <div className="wrap">
          {head('Diet', 'Fuel the', 'work', 'Simple meal plans for your goal, plus a calculator for your calories and macros.')}
          <Diet />
        </div>
      </section>

      <section id="reminders" className="alt">
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
      <nav className="tabbar" aria-label="Quick navigation">
        {[['user', 'trainer', 'Trainer'], ['dumbbell', 'exercises', 'Exercises'], ['calendar', 'plans', 'Plans'], ['apple', 'diet', 'Diet'], ['bell', 'reminders', 'Alerts']].map(([icon, id, label]) => (
          <a key={id} href={`#${id}`}><Icon n={icon} /><span>{label}</span></a>
        ))}
      </nav>
    </div>
  )
}
