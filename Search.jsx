import { useEffect, useMemo, useRef, useState } from 'react'
import { exercises } from './exercises'
import { supplements } from './supplements'
import { foods } from './foods'
import { topics } from './topics'
import { gearTabs, tierLabel, avoid } from './gearData'

const RECENT_KEY = 'ironline-search-recent'
const TYPES = ['Exercises', 'Muscles', 'Supplements', 'Foods', 'Gear', 'Topics']
const SUGGESTIONS = ['bench press', 'biceps', 'creatine', 'paneer', 'running shoes', 'perfume', 'before workout', 'sleep']

// Each muscle lists which exercises train it. `test` gets the exercise name and its library group.
const muscles = [
  { n: 'Chest', alias: 'pecs pectorals pec', role: 'Pushes your arms forward and together. Big part of any press or push-up.', test: (n, g) => g === 'Chest' },
  { n: 'Back (lats and upper back)', alias: 'lats latissimus traps trapezius rhomboids rear', role: 'Pulls your arms down and back and holds your posture. Think rows and pulldowns.', test: (n, g) => g === 'Back' && !/back extension|deadlift|rack pull|good morning|superman/i.test(n) },
  { n: 'Shoulders', alias: 'delts deltoids', role: 'Lifts your arms overhead and to the side and stabilises every press.', test: (n, g) => g === 'Shoulders' },
  { n: 'Biceps', alias: 'bicep arms arm front', role: 'Bends your elbow and helps in every pulling move.', test: (n) => /curl|pull-up|chin-up|pulldown|row/i.test(n) },
  { n: 'Triceps', alias: 'tricep arms arm back of arm', role: 'Straightens your elbow. Makes up about two thirds of your upper arm.', test: (n) => /pushdown|skull|triceps|dip|bench press|push-up|overhead press|push press|kickback|close-grip/i.test(n) },
  { n: 'Forearms and grip', alias: 'forearm grip wrists', role: 'Hold the bar. Grip often limits rows, pull-ups and deadlifts.', test: (n) => /curl|deadlift|rack pull|pull-up|chin-up|swing|row/i.test(n) },
  { n: 'Quads', alias: 'quadriceps thighs front of thigh legs leg', role: 'Straighten your knee. The main muscle in squats, lunges and leg presses.', test: (n) => /squat|leg press|lunge|leg extension|wall sit/i.test(n) },
  { n: 'Hamstrings', alias: 'hamstring back of thigh legs leg', role: 'Bend your knee and extend your hip. Key for sprinting, jumping and deadlifts.', test: (n) => /romanian|deadlift|rack pull|good morning|leg curl|hip thrust|glute bridge/i.test(n) },
  { n: 'Glutes', alias: 'glute butt hips bum gluteus', role: 'Extend your hip and power your standing, climbing and lifting.', test: (n) => /hip thrust|glute bridge|squat|lunge|deadlift|rack pull|good morning|romanian|swing|leg press/i.test(n) },
  { n: 'Calves', alias: 'calf lower leg soleus gastrocnemius', role: 'Point your toes and absorb impact when you walk, run and jump.', test: (n) => /calf|jump|high knees/i.test(n) },
  { n: 'Abs and core', alias: 'abs core abdominals abdomen six pack stomach belly obliques', role: 'Brace your spine and transfer force between your upper and lower body.', test: (n, g) => g === 'Core' || /plank|mountain climber/i.test(n) },
  { n: 'Lower back', alias: 'spine erectors lumbar back', role: 'Keeps your spine straight under load and extends your torso.', test: (n) => /deadlift|rack pull|good morning|superman|back extension|romanian|swing|bent-over|pendlay/i.test(n) },
]

const norm = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = (value) => norm(value).split(' ').filter(Boolean)

const allExercises = Object.entries(exercises).flatMap(([group, list]) => list.map((ex) => ({ ...ex, group })))
const musclesFor = (ex) => muscles.filter((m) => m.test(ex.n, ex.group))

function buildIndex() {
  const items = []
  allExercises.forEach((ex) => {
    const trained = musclesFor(ex)
    items.push({
      id: `ex:${ex.n}`, type: 'Exercises', name: ex.n, sub: `${ex.group} · ${ex.s}`, go: 'exercises', ex,
      alias: `${ex.group} ${trained.map((m) => `${m.n} ${m.alias}`).join(' ')}`, tags: 'exercise workout lift', body: ex.t,
    })
  })
  muscles.forEach((m) => {
    items.push({
      id: `mu:${m.n}`, type: 'Muscles', name: m.n, sub: 'Muscle group', go: 'exercises', m,
      alias: m.alias, tags: 'muscle anatomy train', body: m.role,
    })
  })
  supplements.forEach((s) => {
    items.push({
      id: `su:${s.id}`, type: 'Supplements', name: s.name, sub: s.verdict, go: 'supplements', s,
      alias: s.id, tags: 'supplement', body: `${s.what} ${s.who} ${s.dose}`,
    })
  })
  foods.forEach((fd) => {
    items.push({
      id: `fo:${fd.n}`, type: 'Foods', name: fd.n, sub: `${fd.serv} · ${fd.kcal} kcal · ${fd.p} g protein`, go: 'diet', fd,
      alias: fd.tags, tags: 'food nutrition calories macros', body: '',
    })
  })
  Object.entries(gearTabs).forEach(([tab, list]) => {
    list.forEach((g) => {
      items.push({
        id: `ge:${tab}:${g.n}`, type: 'Gear', name: g.n, sub: `${tab} · ${tierLabel[g.tier]}`, go: 'gear', g, tab,
        alias: `${tab} gym gear buy wear shop`, tags: 'gear', body: `${g.why} ${g.look}`,
      })
    })
  })
  Object.entries(avoid).forEach(([when, list]) => {
    list.forEach((a) => {
      items.push({
        id: `av:${when}:${a.n}`, type: 'Topics', name: a.n, sub: `Avoid ${when.toLowerCase()} a workout`, go: 'avoid', a, when,
        alias: `avoid dont ${when} workout`, tags: 'mistake avoid', body: `${a.why} ${a.instead}`,
      })
    })
  })
  topics.forEach((tp) => {
    items.push({
      id: `tp:${tp.id}`, type: 'Topics', name: tp.n, sub: 'Fitness topic', go: tp.go, tp,
      alias: tp.tags, tags: 'guide advice', body: tp.t,
    })
  })
  return items.map((item) => ({
    ...item,
    nameW: words(item.name), aliasW: words(item.alias), tagW: words(item.tags), bodyW: words(item.body), nameN: norm(item.name),
  }))
}

const INDEX = buildIndex()
const BY_ID = Object.fromEntries(INDEX.map((item) => [item.id, item]))

function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < rowMin) rowMin = cur[j]
    }
    if (rowMin > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

// How well does one query word match a list of words? 0 means no match.
function level(token, list) {
  let best = 0
  for (const w of list) {
    if (w === token) return 1
    if (token.length >= 2 && w.startsWith(token)) best = Math.max(best, 0.8)
    else if (token.length >= 3 && w.includes(token)) best = Math.max(best, 0.5)
    else if (token.length >= 4 && w.length >= 4 && best < 0.45) {
      const max = token.length >= 7 ? 2 : 1
      if (lev(token, w, max) <= max) best = Math.max(best, 0.45)
    }
  }
  return best
}

export function search(query, type) {
  const tokens = words(query)
  if (!tokens.length) return []
  const phrase = tokens.join(' ')
  const out = []
  INDEX.forEach((item) => {
    if (type !== 'All' && item.type !== type) return
    let total = 0
    for (const token of tokens) {
      const score = Math.max(
        10 * level(token, item.nameW),
        8 * level(token, item.aliasW),
        5 * level(token, item.tagW),
        2 * level(token, item.bodyW),
      )
      if (score === 0) return
      total += score
    }
    if (item.nameN.startsWith(phrase)) total += 8
    else if (item.nameN.includes(phrase)) total += 5
    out.push({ item, score: total })
  })
  return out.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).map((r) => r.item)
}

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function Hl({ text, tokens }) {
  const usable = tokens.filter((t) => t.length >= 2)
  if (!usable.length) return text
  const parts = text.split(new RegExp(`(${usable.map(escapeRe).join('|')})`, 'ig'))
  return parts.map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

function readRecent() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(list) ? list.filter((id) => BY_ID[id]).slice(0, 5) : []
  } catch {
    return []
  }
}

function Detail({ item, onPick, onClose, onGear, Figure }) {
  const link = (label) => <a className="btn gold sm sd-go" href={`#${item.go}`} onClick={() => { if (item.tab) onGear(item.tab); onClose() }}>{label}</a>
  if (item.ex) {
    const trained = musclesFor(item.ex)
    return (
      <>
        <p className="sd-type">Exercise · {item.ex.group}</p>
        <h3>{item.name}</h3>
        <div className="fig-wrap sd-fig"><Figure key={item.ex.n} ex={item.ex} /></div>
        <ul className="facts"><li>{item.ex.s}</li></ul>
        <p>{item.ex.t}</p>
        {trained.length > 0 && (
          <>
            <p className="sd-lbl">Muscles worked</p>
            <div className="sd-chips">{trained.map((m) => <button type="button" key={m.n} onClick={() => onPick(`mu:${m.n}`)}>{m.n}</button>)}</div>
          </>
        )}
        {link('Open exercise library')}
      </>
    )
  }
  if (item.m) {
    const list = allExercises.filter((ex) => item.m.test(ex.n, ex.group))
    return (
      <>
        <p className="sd-type">Muscle</p>
        <h3>{item.name}</h3>
        <p>{item.m.role}</p>
        <p className="sd-lbl">{list.length} exercises in the library</p>
        <div className="sd-list">
          {list.map((ex) => <button type="button" key={ex.n} onClick={() => onPick(`ex:${ex.n}`)}><b>{ex.n}</b><span>{ex.s}</span></button>)}
        </div>
        {link('Open exercise library')}
      </>
    )
  }
  if (item.s) {
    const s = item.s
    return (
      <>
        <p className="sd-type">Supplement</p>
        <h3>{s.name}</h3>
        <span className={`s-tag ${s.tier}`}>{s.verdict}</span>
        <dl className="sd-dl">
          {[['What it does', s.what], ['Best form', s.form], ['How much', s.dose], ['When', s.when], ['Who needs it', s.who], ['Be careful', s.care]].map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {link('Open supplements')}
      </>
    )
  }
  if (item.g) {
    const g = item.g
    return (
      <>
        <p className="sd-type">Gear · {item.tab}</p>
        <h3>{g.n}</h3>
        <span className={`s-tag ${g.tier}`}>{tierLabel[g.tier]}</span>
        <dl className="sd-dl">
          {[['Why', g.why], ['What to look for', g.look], ['Rough price', g.price]].map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <p className="note">Prices are rough Indian ranges and change often.</p>
        {link('Open gear guide')}
      </>
    )
  }
  if (item.a) {
    return (
      <>
        <p className="sd-type">Avoid {item.when.toLowerCase()} a workout</p>
        <h3>{item.name}</h3>
        <dl className="sd-dl">
          <div><dt>Why</dt><dd>{item.a.why}</dd></div>
          <div><dt>Instead</dt><dd>{item.a.instead}</dd></div>
        </dl>
        {link('Open the avoid guide')}
      </>
    )
  }
  if (item.fd) {
    const fd = item.fd
    const per100 = Math.round((fd.p / fd.kcal) * 100 * 10) / 10
    return (
      <>
        <p className="sd-type">Food · {fd.serv}</p>
        <h3>{fd.n}</h3>
        <div className="sd-macros">
          <div><b>{fd.kcal}</b><span>kcal</span></div>
          <div><b>{fd.p} g</b><span>Protein</span></div>
          <div><b>{fd.c} g</b><span>Carbs</span></div>
          <div><b>{fd.f} g</b><span>Fat</span></div>
        </div>
        <p>About {per100} g of protein per 100 kcal. {per100 >= 10 ? 'That is a protein-dense choice.' : per100 >= 5 ? 'A decent protein source.' : 'Mainly a carb or fat source.'}</p>
        <p className="note">Approximate values. Brands, cooking and portion size change the numbers.</p>
        {link('Open diet plans')}
      </>
    )
  }
  return (
    <>
      <p className="sd-type">Fitness topic</p>
      <h3>{item.name}</h3>
      <p>{item.tp.t}</p>
      {link('Go to the related section')}
    </>
  )
}

export default function SearchModal({ onClose, onGear, Figure }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [active, setActive] = useState(0)
  const [selected, setSelected] = useState(null)
  const [recent, setRecent] = useState(readRecent)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)

  const tokens = useMemo(() => words(query), [query])
  const all = useMemo(() => search(query, 'All'), [query])
  const results = useMemo(() => (type === 'All' ? all : all.filter((item) => item.type === type)), [all, type])
  const counts = useMemo(() => Object.fromEntries(TYPES.map((t) => [t, all.filter((item) => item.type === t).length])), [all])
  const hasQuery = tokens.length > 0
  const browse = useMemo(() => {
    if (hasQuery) return []
    const ids = recent.length ? recent : []
    return ids.map((id) => BY_ID[id])
  }, [hasQuery, recent])
  const shown = hasQuery ? results : browse
  const current = Math.min(active, Math.max(shown.length - 1, 0))
  const previewId = selected || shown[current]?.id
  const preview = previewId ? BY_ID[previewId] : null

  useEffect(() => {
    const opener = document.activeElement
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [current, shown])

  const remember = (id) => {
    const next = [id, ...recent.filter((x) => x !== id)].slice(0, 5)
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      // Ignore blocked storage.
    }
  }
  const pick = (id) => {
    setSelected(id)
    remember(id)
  }
  const clearRecent = () => {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {
      // Ignore blocked storage.
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (selected) setSelected(null)
      else onClose()
    } else if (event.key === 'ArrowDown' && shown.length) {
      event.preventDefault()
      setSelected(null)
      setActive((current + 1) % shown.length)
    } else if (event.key === 'ArrowUp' && shown.length) {
      event.preventDefault()
      setSelected(null)
      setActive((current - 1 + shown.length) % shown.length)
    } else if (event.key === 'Enter' && event.target === inputRef.current && shown[current]) {
      event.preventDefault()
      pick(shown[current].id)
    } else if (event.key === 'Tab') {
      const nodes = [...panelRef.current.querySelectorAll('button:not([disabled]),a[href],input,select')].filter((node) => node.offsetParent !== null)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const setQ = (value) => {
    setQuery(value)
    setActive(0)
    setSelected(null)
  }

  return (
    <div className="srch" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className={`srch-panel${selected ? ' show-detail' : ''}`} role="dialog" aria-modal="true" aria-label="Search Ironline" ref={panelRef} onKeyDown={onKeyDown}>
        <div className="srch-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input
            ref={inputRef} type="search" value={query} onChange={(event) => setQ(event.target.value)}
            placeholder="Search exercises, foods, gear, supplements" autoComplete="off" autoCorrect="off" spellCheck="false" enterKeyHint="search"
            role="combobox" aria-expanded={shown.length > 0} aria-controls="srch-list" aria-autocomplete="list"
            aria-activedescendant={shown[current] ? `srch-opt-${current}` : undefined} aria-label="Search"
          />
          <button type="button" className="srch-x" onClick={onClose} aria-label="Close search">Esc</button>
        </div>

        {hasQuery && (
          <div className="srch-types" role="group" aria-label="Filter results">
            <button type="button" aria-pressed={type === 'All'} onClick={() => { setType('All'); setActive(0) }}>All <i>{all.length}</i></button>
            {TYPES.map((t) => (
              <button type="button" key={t} aria-pressed={type === t} disabled={!counts[t]} onClick={() => { setType(t); setActive(0) }}>{t} <i>{counts[t]}</i></button>
            ))}
          </div>
        )}

        <div className="srch-body">
          <div className="srch-results" ref={listRef}>
            {!hasQuery && (
              <div className="srch-empty">
                <p className="sd-lbl">Try searching for</p>
                <div className="sd-chips">{SUGGESTIONS.map((s) => <button type="button" key={s} onClick={() => { setQ(s); inputRef.current?.focus() }}>{s}</button>)}</div>
                {shown.length > 0 && <p className="sd-lbl recent-lbl">Recent <button type="button" onClick={clearRecent}>Clear</button></p>}
              </div>
            )}
            {shown.length > 0 && (
              <ul id="srch-list" role="listbox" aria-label={hasQuery ? 'Search results' : 'Recent searches'}>
                {shown.map((item, i) => (
                  <li key={item.id} id={`srch-opt-${i}`} role="option" aria-selected={i === current} className={i === current ? 'on' : ''}
                    onMouseMove={() => { if (i !== current) setActive(i) }} onClick={() => pick(item.id)}>
                    <span className={`srch-type t-${item.type.toLowerCase()}`}>{item.type.replace(/s$/, '')}</span>
                    <span className="srch-name"><b><Hl text={item.name} tokens={tokens} /></b><small>{item.sub}</small></span>
                  </li>
                ))}
              </ul>
            )}
            {hasQuery && shown.length === 0 && (
              <div className="srch-empty" role="status">
                <p><b>No results for &ldquo;{query.trim()}&rdquo;</b></p>
                <p className="note">Check the spelling, try a shorter word, or search a muscle (chest, glutes), a food (paneer, oats) or a topic (protein, sleep).</p>
                <div className="sd-chips">{SUGGESTIONS.slice(0, 5).map((s) => <button type="button" key={s} onClick={() => setQ(s)}>{s}</button>)}</div>
              </div>
            )}
          </div>

          <div className="srch-detail" aria-live="polite">
            {selected && <button type="button" className="srch-back" onClick={() => setSelected(null)}>&larr; Back to results</button>}
            {preview ? <Detail item={preview} onPick={pick} onClose={onClose} onGear={onGear} Figure={Figure} /> : <p className="srch-hint">Results show here. Use the arrow keys to move and Enter to open.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
