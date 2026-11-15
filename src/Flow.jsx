import { useState } from 'react'
import { goalNames } from './goals'
import { Pills, PlanDay } from './Tracking'
import { goalOf, LEVEL_OPTIONS } from './profile'

const DAY_OPTIONS = [2, 3, 4, 5, 6]

export function Onboarding({ initial, onSave, onSkip }) {
  const [goal, setGoal] = useState(goalOf(initial))
  const [level, setLevel] = useState(initial?.level || 'Simple')
  const [days, setDays] = useState(Number(initial?.days) || 3)
  const levelLabel = LEVEL_OPTIONS.find(([, id]) => id === level)[0]
  const save = () => {
    try {
      localStorage.setItem('ironline-goal', goal)
      localStorage.setItem('ironline-weekly-goal', JSON.stringify(days))
    } catch {
      // Blocked storage: the profile below still works for this visit.
    }
    onSave({ goal, level, days, split: null, pos: 0, done: true })
  }
  return (
    <div className="card onb">
      <p className="eyebrow"><i aria-hidden="true" />Start here · 3 quick questions</p>
      <h3 className="goal-sub">What is your goal?</h3>
      <Pills items={goalNames} value={goal} onChange={setGoal} label="Fitness goal" />
      <h3 className="goal-sub">How experienced are you?</h3>
      <Pills items={LEVEL_OPTIONS.map(([l]) => l)} value={levelLabel} onChange={(l) => setLevel(LEVEL_OPTIONS.find(([x]) => x === l)[1])} label="Experience level" />
      <h3 className="goal-sub">How many days a week can you train?</h3>
      <Pills items={DAY_OPTIONS.map((d) => `${d} days`)} value={`${days} days`} onChange={(v) => setDays(Number(v[0]))} label="Training days per week" />
      <div className="start-actions">
        <button type="button" className="btn gold" onClick={save}>Save my start card</button>
        {onSkip && <button type="button" className="btn ghost" onClick={onSkip}>Skip, just let me train</button>}
      </div>
    </div>
  )
}

export function StartCard({ profile, coach, today, onEdit }) {
  const levelLabel = (LEVEL_OPTIONS.find(([, id]) => id === profile.level) || LEVEL_OPTIONS[0])[0]
  return (
    <div className="card start">
      <p className="eyebrow"><i aria-hidden="true" />Your start card</p>
      <h3>{goalOf(profile)}</h3>
      <ul className="facts"><li>{levelLabel}</li><li>Coach {coach}</li><li>{profile.days} days a week</li></ul>
      <p className="diet-note">{today ? <>Next up: <b>{today.title}</b>.</> : 'Pick a day below to start.'}</p>
      <div className="start-actions">
        <a href="#today" className="btn gold">Start today&rsquo;s workout</a>
        <button type="button" className="btn ghost" onClick={onEdit}>Change answers</button>
      </div>
    </div>
  )
}

export function SplitWeek({ week, onSplit, onPick }) {
  const label = (o) => `${o.label}${o.key === week.recKey ? ' · recommended' : ''}`
  return (
    <>
      <h3 className="goal-sub">Your split</h3>
      <Pills items={week.options.map(label)} value={label(week.options.find((o) => o.key === week.key))} onChange={(l) => onSplit(week.options.find((o) => label(o) === l).key)} label="Training split" />
      <div className="goal-list">
        {week.rows.map((r, i) => (
          <PlanDay key={`${week.key}-${i}`} day={r.day} title={r.title} detail={r.detail}>
            {week.strength.includes(i) && (i === week.strength[week.pos]
              ? <span className="today-tag">Today&rsquo;s workout</span>
              : <button type="button" className="btn ghost sm" onClick={() => onPick(week.strength.indexOf(i))}>Train this today</button>)}
          </PlanDay>
        ))}
      </div>
    </>
  )
}
