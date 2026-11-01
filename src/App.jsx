import { useEffect, useRef, useState } from 'react'
import { registerPush, saveSubscription } from './push'
import './App.css'

const BRAND = 'Ironline'
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
            <span className="slot-time">{time}</span>
            <strong>{name}</strong>
            <span className="slot-coach">{coach}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Join() {
  const [interest, setInterest] = useState(programs[0].name)
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
        <h2>Join free. <em>Start this week.</em></h2>
        <p className="lead">Membership costs nothing. Tell us what you want to train and a coach will set up your first session. We reply within one working day.</p>
      </div>
      {submitted ? (
        <div className="ok" role="status">
          <h3>Thanks, {form.name.trim().split(/\s+/)[0]}.</h3>
          <p>Your request is ready, but this demo does not send bookings yet. Email <a href={`mailto:hello@ironline.example?subject=${encodeURIComponent('Free first session')}&body=${encodeURIComponent(`Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\nInterest: ${interest}`)}`}>hello@ironline.example</a> to arrange your {interest} intro.</p>
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
            What do you want to train?
            <select value={interest} onChange={(event) => setInterest(event.target.value)}>
              {programs.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn gold" type="submit">Join for free</button>
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

  return (
    <div className="gym">
      <div className="aura" aria-hidden="true" />
      <nav className="site-nav" aria-label="Main navigation">
        <div className="nav-pill">
          <a href="#top" className="logo" onClick={closeMenu}><i aria-hidden="true" />{BRAND}</a>
          <div className={`links${menuOpen ? ' is-open' : ''}`} id="site-links">
            <a href="#programs" onClick={closeMenu}>Programs</a>
            <a href="#schedule" onClick={closeMenu}>Schedule</a>
            <a href="#coaches" onClick={closeMenu}>Coaches</a>
            <a href="#reminders" onClick={closeMenu}>Reminders</a>
            <a href="#free" onClick={closeMenu}>Membership</a>
          </div>
          <a href="#join" className="btn gold sm nav-cta" onClick={closeMenu}>Join free</a>
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
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div className="hero-content">
            <p className="eyebrow"><i aria-hidden="true" />A private strength club</p>
            <h1>Strength,<br /><em>refined.</em></h1>
            <p className="hero-copy">A private, coached strength club with competition equipment, small classes and a recovery suite. It feels like yours by the second week.</p>
            <div className="actions">
              <a href="#join" className="btn gold">Join for free</a>
              <a href="#schedule" className="btn ghost">See classes</a>
            </div>
            <dl className="stats">
              <div><dt>12</dt><dd>Max per class</dd></div>
              <div><dt>4</dt><dd>Programs</dd></div>
              <div><dt>3</dt><dd>Head coaches</dd></div>
            </dl>
          </div>
          <Barbell />
        </div>
      </header>

      <section className="amen" aria-label="Club amenities">
        <div className="wrap">
          {[
            ['01', 'Competition racks', 'Calibrated plates, deadlift platforms and chalk welcome.'],
            ['02', 'Recovery suite', 'Sauna and cold plunge, included for every member.'],
            ['03', 'Private lockers', 'Full length lockers, fresh towels and showers.'],
            ['04', 'Small classes', 'Twelve people at most, always with a coach.'],
          ].map(([n, title, description]) => (
            <div key={title}><span className="n">{n}</span><h3>{title}</h3><p>{description}</p></div>
          ))}
        </div>
      </section>

      <section id="programs">
        <div className="wrap split">
          <div className="sec-head">
            <p className="eyebrow"><i aria-hidden="true" />Programs</p>
            <h2>Four ways <em>to train</em></h2>
            <p className="lead">Pick one or mix them. Every session is coached and scaled to you.</p>
          </div>
          <Accordion />
        </div>
      </section>

      <section id="schedule" className="alt">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow"><i aria-hidden="true" />Schedule</p>
            <h2>This week&apos;s <em>classes</em></h2>
            <p className="lead">Classes cap at 12 people. Members reserve a spot in the app.</p>
          </div>
          <Schedule />
        </div>
      </section>

      <section id="coaches">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow"><i aria-hidden="true" />Coaches</p>
            <h2>Your <em>coaches</em></h2>
            <p className="lead">Certified, patient and genuinely into this.</p>
          </div>
          <div className="trainers">
            {trainers.map((trainer) => (
              <article key={trainer.name}>
                <div className="avatar" aria-hidden="true"><span>{trainer.name[0]}</span></div>
                <h3>{trainer.name}</h3>
                <em>{trainer.role}</em>
                <p>{trainer.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="reminders" className="alt">
        <div className="wrap"><Reminders /></div>
      </section>

      <section id="free">
        <div className="wrap">
          <div className="free-card">
            <div>
              <p className="eyebrow"><i aria-hidden="true" />Membership</p>
              <h2>Free to join.<br /><em>Free to stay.</em></h2>
              <p className="lead">There is no joining fee and no monthly fee. Sign up, pick a program and start training with a coach.</p>
              <a href="#join" className="btn gold">Join for free</a>
            </div>
            <ul className="perks">
              {['The full gym floor, every open hour', 'Every group class on the schedule', 'Recovery suite and private lockers', 'An intro session with a coach'].map((perk) => <li key={perk}>{perk}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="join" className="alt">
        <div className="wrap"><Join /></div>
      </section>

      <footer>
        <div className="wrap">
          <div><strong>{BRAND}</strong><br />12 Example Street, Your City</div>
          <div>Mon to Fri 5:30 am to 10 pm<br />Sat and Sun 7 am to 8 pm</div>
          <div><a href="mailto:hello@ironline.example">hello@ironline.example</a><br /><a href="tel:+00000000000">+00 000 000 0000</a></div>
        </div>
        <div className="wordmark" aria-hidden="true">{BRAND}</div>
      </footer>
    </div>
  )
}
