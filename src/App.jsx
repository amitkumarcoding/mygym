import { useEffect, useRef, useState } from 'react'
import { registerPush, saveSubscription } from './push'
import './App.css'

const BRAND = 'Ironline'
const CURRENCY = '$'
const REMINDER_KEY = 'ironline-reminders'

const programs = [
  { name: 'Strength floor', text: 'Racks, platforms and chalk. Coached barbell sessions for every level, from first squat to meet prep.' },
  { name: 'Conditioning', text: 'Sleds, rowers and intervals built in 40 minutes. You leave tired, not wrecked.' },
  { name: 'Mobility', text: 'Slow, structured sessions that fix hips, shoulders and ankles so you can lift deeper and pain free.' },
  { name: 'Boxing', text: 'Bag work, pad rounds and footwork drills in small groups. No sparring unless you ask.' },
]

const schedule = {
  Mon: [['6:30 am', 'Strength basics', 'Rhea'], ['12:15 pm', 'Conditioning', 'Dev'], ['6:30 pm', 'Boxing rounds', 'Kabir']],
  Tue: [['6:30 am', 'Mobility reset', 'Rhea'], ['5:30 pm', 'Olympic lifting', 'Dev'], ['7:00 pm', 'Strength basics', 'Rhea']],
  Wed: [['6:30 am', 'Conditioning', 'Kabir'], ['12:15 pm', 'Strength basics', 'Dev'], ['6:30 pm', 'Boxing rounds', 'Kabir']],
  Thu: [['6:30 am', 'Mobility reset', 'Rhea'], ['5:30 pm', 'Powerlifting', 'Dev'], ['7:00 pm', 'Conditioning', 'Kabir']],
  Fri: [['6:30 am', 'Strength basics', 'Dev'], ['12:15 pm', 'Conditioning', 'Kabir'], ['6:00 pm', 'Open floor', 'Team']],
  Sat: [['8:00 am', 'Boxing rounds', 'Kabir'], ['9:30 am', 'Strength basics', 'Rhea'], ['11:00 am', 'Mobility reset', 'Rhea']],
  Sun: [['9:00 am', 'Open floor', 'Team'], ['10:30 am', 'Mobility reset', 'Rhea']],
}

const trainers = [
  { name: 'Dev Malhotra', role: 'Head coach, strength', bio: 'Ten years coaching powerlifters and first timers. Believes the squat fixes most things.' },
  { name: 'Rhea Sethi', role: 'Mobility and rehab', bio: 'Former physio assistant. Writes programs around your injuries instead of ignoring them.' },
  { name: 'Kabir Anand', role: 'Boxing and conditioning', bio: 'Amateur boxer turned coach. Runs the loudest, friendliest room in the building.' },
]

const plans = [
  { id: 'Off-peak', monthly: 29, perks: ['Gym floor 10 am to 4 pm', 'Locker room and showers', 'One free coach intro'] },
  { id: 'Full access', monthly: 49, perks: ['Gym floor, every hour', 'All group classes', 'Monthly body check-in'], featured: true },
  { id: 'Coached', monthly: 119, perks: ['Everything in Full access', '4 one-to-one sessions a month', 'Written training plan'] },
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
      <small>Load the bar</small>
      <svg viewBox="0 0 520 190" role="img" aria-label={`Barbell loaded to ${total} kilograms`}>
        <rect x="10" y="92" width="500" height="8" fill="#9FADA6" />
        <rect x="200" y="86" width="120" height="20" fill="#B8975A" opacity=".4" />
        {load.map((weight, index) => {
          const [height, opacity] = plates[weight]
          return (
            <g key={`${weight}-${index}`}>
              <rect className="plate" x={190 - (index + 1) * 22} y={96 - height / 2} width="18" height={height} fill="#B8975A" fillOpacity={opacity} stroke="#EBE6DA" strokeOpacity=".45" />
              <rect className="plate" x={330 + index * 22} y={96 - height / 2} width="18" height={height} fill="#B8975A" fillOpacity={opacity} stroke="#EBE6DA" strokeOpacity=".45" />
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

function Schedule() {
  const [day, setDay] = useState('Mon')
  const dayNames = Object.keys(schedule)

  const handleKeyDown = (event, currentIndex) => {
    let nextIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % dayNames.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + dayNames.length) % dayNames.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = dayNames.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    setDay(dayNames[nextIndex])
    document.getElementById(`schedule-tab-${dayNames[nextIndex]}`)?.focus()
  }

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Day of the week">
        {dayNames.map((currentDay, index) => (
          <button
            key={currentDay}
            id={`schedule-tab-${currentDay}`}
            role="tab"
            aria-selected={day === currentDay}
            aria-controls="schedule-panel"
            tabIndex={day === currentDay ? 0 : -1}
            onClick={() => setDay(currentDay)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {currentDay}
          </button>
        ))}
      </div>
      <div id="schedule-panel" role="tabpanel" aria-labelledby={`schedule-tab-${day}`} tabIndex={0}>
        {schedule[day].map(([time, name, coach]) => (
          <div className="slot" key={`${time}-${name}`}>
            <span>{time}</span>
            <strong>{name}</strong>
            <span>with {coach}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Pricing({ onPick }) {
  const [annual, setAnnual] = useState(false)

  return (
    <>
      <div className="toggle" role="group" aria-label="Billing period">
        <button aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
        <button aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly, save 20%</button>
      </div>
      <div className="plans">
        {plans.map((plan) => (
          <article key={plan.id} className={`plan${plan.featured ? ' featured' : ''}`}>
            <h3>{plan.id}</h3>
            <div className="price">{CURRENCY}{annual ? Math.round(plan.monthly * 0.8) : plan.monthly}<small> /month</small></div>
            <small>{annual ? 'Billed yearly' : 'Cancel any month'}</small>
            <ul>{plan.perks.map((perk) => <li key={perk}>{perk}</li>)}</ul>
            <a href="#join" className="btn" onClick={() => onPick(plan.id)}>Choose {plan.id}</a>
          </article>
        ))}
      </div>
    </>
  )
}

function Join({ plan, setPlan }) {
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
        <h2>Book a free first session</h2>
        <p className="lead">Tour the floor, meet a coach and try a class. No card needed. We reply within one working day.</p>
      </div>
      {submitted ? (
        <div className="ok" role="status">
          <h3>Thanks, {form.name.trim().split(/\s+/)[0]}.</h3>
          <p>Your request is ready, but this demo does not send bookings yet. Email <a href={`mailto:hello@ironline.example?subject=${encodeURIComponent('Free first session')}&body=${encodeURIComponent(`Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\nPlan: ${plan}`)}`}>hello@ironline.example</a> to arrange your {plan} intro.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <label>
            Full name
            <input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" />
          </label>
          <label>
            Plan you&apos;re curious about
            <select value={plan} onChange={(event) => setPlan(event.target.value)}>
              {plans.map((item) => <option key={item.id}>{item.id}</option>)}
            </select>
          </label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn blue" type="submit">Prepare my request</button>
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
          <p className="eyebrow">Good habits, built in</p>
          <h2>Stay on plan</h2>
          <p className="lead">Set water and meal reminders. Turn on notifications and we'll send them to your device even when this site is closed.</p>
          {permission === 'default' && <button className="btn blue" onClick={enableNotifications}>Turn on notifications</button>}
          {permission === 'granted' && <p className="note">Browser notifications are on.</p>}
          {permission === 'denied' && <p className="note">Notifications are blocked. Allow them in your browser&apos;s site settings, or rely on on-page alerts.</p>}
          {permission === 'unsupported' && <p className="note">This browser does not support notifications. On-page reminders remain available.</p>}
          {pushStatus === 'on' && <p className="note">Background reminders are connected.</p>}
          {pushStatus === 'error' && <p className="note" role="status">Background reminders are unavailable. Check your Firebase and web-push configuration; on-page reminders remain available.</p>}
          {storageError && <p className="note" role="status">Reminder settings could not be saved in this browser.</p>}
          <button className="btn reminder-test" onClick={() => notify('Test reminder', 'This is how your reminders will look.')}>Send a test reminder</button>
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

function Accordion() {
  const [open, setOpen] = useState(0)

  return (
    <div className="rows">
      {programs.map((program, index) => {
        const isOpen = open === index
        return (
          <div className={`row${isOpen ? ' open' : ''}`} key={program.name}>
            <button
              aria-expanded={isOpen}
              aria-controls={`program-panel-${index}`}
              onClick={() => setOpen(isOpen ? -1 : index)}
            >
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
  const [plan, setPlan] = useState('Full access')
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="gym">
      <nav className="site-nav" aria-label="Main navigation">
        <div className="wrap">
          <a href="#top" className="logo" onClick={closeMenu}>{BRAND}</a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-links"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
          </button>
          <div className={`links${menuOpen ? ' is-open' : ''}`} id="site-links">
            <a href="#programs" onClick={closeMenu}>Programs</a>
            <a href="#schedule" onClick={closeMenu}>Schedule</a>
            <a href="#coaches" onClick={closeMenu}>Coaches</a>
            <a href="#reminders" onClick={closeMenu}>Reminders</a>
            <a href="#pricing" onClick={closeMenu}>Pricing</a>
            <a href="#join" className="btn blue" onClick={closeMenu}>Free session</a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div className="hero-content">
            <p className="eyebrow">A private strength club</p>
            <h1>Serious training, quietly done.</h1>
            <p className="hero-copy">A private, coached strength club with competition equipment, small classes and a recovery suite. It feels like yours by the second week.</p>
            <div className="actions">
              <a href="#join" className="btn blue">Book a free session</a>
              <a href="#pricing" className="btn ghost">See pricing</a>
            </div>
          </div>
          <Barbell />
        </div>
      </header>

      <section className="amen" aria-label="Club amenities">
        <div className="wrap">
          {[
            ['Competition racks', 'Calibrated plates, deadlift platforms and chalk welcome.'],
            ['Recovery suite', 'Sauna and cold plunge, included with every plan.'],
            ['Private lockers', 'Full length lockers, fresh towels and showers.'],
            ['Small classes', 'Twelve people at most, always with a coach.'],
          ].map(([title, description]) => (
            <div key={title}><h3>{title}</h3><p>{description}</p></div>
          ))}
        </div>
      </section>

      <section id="programs">
        <div className="wrap">
          <h2>Four ways to train</h2>
          <p className="lead">Pick one or mix them. Every session is coached and scaled to you.</p>
          <Accordion />
        </div>
      </section>

      <section id="schedule" className="light">
        <div className="wrap">
          <h2>This week&apos;s classes</h2>
          <p className="lead">Classes cap at 12 people. Members reserve a spot in the app.</p>
          <Schedule />
        </div>
      </section>

      <section id="coaches">
        <div className="wrap">
          <h2>Your coaches</h2>
          <p className="lead">Certified, patient and genuinely into this.</p>
          <div className="trainers">
            {trainers.map((trainer) => (
              <article key={trainer.name}>
                <div className="avatar" aria-hidden="true">{trainer.name[0]}</div>
                <h3>{trainer.name}</h3>
                <em>{trainer.role}</em>
                <p>{trainer.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reminders" className="moss">
        <div className="wrap"><Reminders /></div>
      </section>

      <section id="pricing" className="light">
        <div className="wrap">
          <h2>Simple pricing</h2>
          <p className="lead">No joining fee. Pause or cancel from your account.</p>
          <Pricing onPick={setPlan} />
        </div>
      </section>

      <section id="join">
        <div className="wrap"><Join plan={plan} setPlan={setPlan} /></div>
      </section>

      <footer>
        <div className="wrap">
          <div><strong>{BRAND}</strong><br />12 Example Street, Your City</div>
          <div>Mon to Fri 5:30 am to 10 pm<br />Sat and Sun 7 am to 8 pm</div>
          <div><a href="mailto:hello@ironline.example">hello@ironline.example</a><br /><a href="tel:+00000000000">+00 000 000 0000</a></div>
        </div>
      </footer>
    </div>
  )
}
