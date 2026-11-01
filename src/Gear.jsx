import { useState } from 'react'
import { Pills } from './Tracking'
import { gearTabs, tierLabel, avoid } from './gearData'

const tabNames = Object.keys(gearTabs)

// Quick checklist of everything a gym-goer needs. Cards jump to the right place.
export function Checklist({ onGear }) {
  const cards = [
    ['Supplements you need', 'Protein, creatine and what to skip', '#supplements'],
    ['Wearables', 'Clothes, band, earphones', '#gear', 'Wearables'],
    ['Equipment', 'For home or the gym', '#gear', 'Equipment'],
    ['Shoes', 'Lifting, running, fit', '#gear', 'Shoes'],
    ['Gym perfume', 'Smell fresh the right way', '#gear', 'Perfume'],
    ['Gym bag', 'Towel, bottle, lock and more', '#gear', 'Bag essentials'],
    ['What to avoid', 'Before and after a workout', '#avoid'],
  ]
  return (
    <ul className="check" aria-label="Gym checklist">
      {cards.map(([title, text, href, tab]) => (
        <li key={title}>
          <a href={href} onClick={() => tab && onGear(tab)}>
            <b>{title}</b>
            <span>{text}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Gear({ tab, setTab }) {
  const items = gearTabs[tab] || []
  return (
    <>
      <Pills items={tabNames} value={tab} onChange={setTab} label="Gear category" />
      <div className="gear-grid">
        {items.map((item) => (
          <article className={`gear-card ${item.tier}`} key={item.n}>
            <div className="gear-top">
              <h3>{item.n}</h3>
              <span className={`s-tag ${item.tier}`}>{tierLabel[item.tier]}</span>
            </div>
            <p>{item.why}</p>
            <dl>
              <div><dt>What to look for</dt><dd>{item.look}</dd></div>
              <div><dt>Rough price</dt><dd>{item.price}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <p className="note">Prices are rough Indian ranges and change often. Compare before you buy, and fit and comfort matter more than brand. Check with a doctor if you have a health condition before choosing support gear.</p>
    </>
  )
}

export function Avoid() {
  const [when, setWhen] = useState('Before')
  return (
    <>
      <Pills items={['Before', 'After']} value={when} onChange={setWhen} label="Before or after the workout" />
      <p className="diet-note">{when === 'Before' ? 'Get the most from your session. Avoid these in the hours before you train.' : 'Recover faster and keep your progress. Avoid these once you finish.'}</p>
      <ul className="avoid-list">
        {avoid[when].map((item) => (
          <li key={item.n}>
            <span className="avoid-x" aria-hidden="true">&times;</span>
            <div>
              <b>{item.n}</b>
              <p>{item.why}</p>
              <p className="avoid-do"><em>Instead:</em> {item.instead}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="note">General guidance, not medical advice. Speak to a doctor if you have a health condition, take medication or feel unwell during exercise.</p>
    </>
  )
}
