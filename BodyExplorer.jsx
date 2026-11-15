import { useMemo, useState } from 'react'
import Body from 'react-muscle-highlighter'
import Figure from './Figure'
import { exercises } from './exercises'
import { Pills } from './Tracking'
import './bodyexplorer.css'

const SLUGS = {
  Chest: ['chest'],
  Shoulders: ['deltoids'],
  Back: ['upper-back', 'lower-back', 'trapezius'],
  Arms: ['biceps', 'triceps', 'forearm'],
  Core: ['abs', 'obliques'],
  Legs: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors', 'tibialis'],
}
const ORDER = ['Chest', 'Shoulders', 'Back', 'Arms', 'Core', 'Legs'].filter((g) => exercises[g])
const BASE = ['head', 'neck', 'hair', 'hands', 'feet', 'ankles', 'knees'].map((slug) => ({
  slug,
  styles: { fill: '#16181c', stroke: 'rgb(216 185 131 / 22%)', strokeWidth: 0.6 },
}))
const SEX = { Men: 'male', Women: 'female' }

export default function BodyExplorer() {
  const [sex, setSex] = useState('Men')
  const [group, setGroup] = useState('Chest')
  const [side, setSide] = useState('front')
  const [pick, setPick] = useState(0)
  const list = exercises[group]
  const ex = list[Math.min(pick, list.length - 1)]

  const data = useMemo(() => [...BASE, ...SLUGS[group].map((slug) => ({ slug, intensity: 2 }))], [group])

  const choose = (g) => {
    setGroup(g)
    setPick(0)
    setSide(g === 'Back' ? 'back' : 'front')
  }
  const onPart = (p) => {
    const g = ORDER.find((n) => SLUGS[n].includes(p.slug))
    if (g) choose(g)
  }

  return (
    <div className="bx">
      <div className="bx-left">
        <div className="bx-bar">
          <Pills items={Object.keys(SEX)} value={sex} onChange={setSex} label="Body type" />
          <Pills items={['Front', 'Back']} value={side === 'front' ? 'Front' : 'Back'} onChange={(v) => setSide(v.toLowerCase())} label="Body view" />
        </div>
        <div className="bx-stage" role="group" aria-label={`${sex} muscle map, ${group} selected`}>
          <div className="bx-spot" aria-hidden="true" />
          <div className="bx-fig" key={`${sex}-${side}`}>
            <Body
              data={data}
              side={side}
              gender={SEX[sex]}
              scale={1.3}
              colors={['#caa76b', '#f6e4bd']}
              border="rgb(216 185 131 / 28%)"
              defaultFill="#1d2025"
              defaultStroke="rgb(216 185 131 / 30%)"
              defaultStrokeWidth={0.7}
              onBodyPartPress={onPart}
            />
          </div>
          <span className="bx-tag">Tap a muscle</span>
        </div>
      </div>

      <div className="bx-right">
        <div className="bx-chips" role="group" aria-label="Muscle group">
          {ORDER.map((g) => (
            <button key={g} type="button" aria-pressed={g === group} onClick={() => choose(g)}>{g}</button>
          ))}
        </div>
        <div className="bx-head">
          <h3 key={group}>{group}</h3>
          <span><b>{list.length}</b> exercises</span>
        </div>
        <div className="bx-demo">
          <div className="fig-wrap"><Figure key={ex.n} ex={ex} /></div>
          <div className="bx-cue">
            <strong>{ex.n}</strong>
            <span className="bx-sets">{ex.s}</span>
            <p>{ex.t}</p>
          </div>
        </div>
        <ul className="bx-list">
          {list.map((e, i) => (
            <li key={e.n}>
              <button type="button" aria-pressed={e.n === ex.n} onClick={() => setPick(i)}>
                <span>{e.n}</span><small>{e.s}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
