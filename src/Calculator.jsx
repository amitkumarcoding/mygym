import { useEffect, useState } from 'react'
import { Pills } from './Tracking'
import './calculator.css'

const KEY = 'ironline-calc'
const ACT = { Sedentary: 1.2, 'Light (1–3 days)': 1.375, 'Moderate (3–5 days)': 1.55, 'Heavy (6–7 days)': 1.725 }
const GOALS = { 'Lose fat': [-400, 2.2], Maintain: [0, 1.6], 'Build muscle': [300, 2], }
const SEX = ['Male', 'Female']
const init = { sex: 'Male', age: '', h: '', w: '', act: 'Light (1–3 days)', goal: 'Maintain' }

const read = () => {
  try { return { ...init, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return init }
}

export default function Calculator() {
  const [f, setF] = useState(read)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(f)) } catch { /* storage blocked */ }
  }, [f])
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v && v.target ? v.target.value : v }))

  const age = Number(f.age), h = Number(f.h), w = Number(f.w)
  const ok = age >= 15 && age <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250
  let r = null
  if (ok) {
    const bmr = 10 * w + 6.25 * h - 5 * age + (f.sex === 'Male' ? 5 : -161)
    const tdee = bmr * ACT[f.act]
    const [adj, pk] = GOALS[f.goal]
    const kcal = Math.max(Math.round((tdee + adj) / 10) * 10, f.sex === 'Male' ? 1500 : 1200)
    const p = Math.round(w * pk)
    const fat = Math.round((kcal * 0.25) / 9)
    const carb = Math.max(Math.round((kcal - p * 4 - fat * 9) / 4), 0)
    r = { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, p, fat, carb, water: (w * 0.035).toFixed(1), bmi: (w / (h / 100) ** 2).toFixed(1) }
  }
  const bar = (g, k) => ({ width: `${Math.min(((g * k) / r.kcal) * 100, 100)}%` })

  return (
    <div className="calc card">
      <div className="calc-in">
        <Pills items={SEX} value={f.sex} onChange={set('sex')} label="Sex" />
        <div className="calc-row">
          <label>Age<input type="number" inputMode="numeric" min="15" max="90" placeholder="25" value={f.age} onChange={set('age')} /></label>
          <label>Height (cm)<input type="number" inputMode="numeric" min="120" max="230" placeholder="175" value={f.h} onChange={set('h')} /></label>
          <label>Weight (kg)<input type="number" inputMode="decimal" min="30" max="250" placeholder="70" value={f.w} onChange={set('w')} /></label>
        </div>
        <label>Activity<select value={f.act} onChange={set('act')}>{Object.keys(ACT).map((a) => <option key={a}>{a}</option>)}</select></label>
        <Pills items={Object.keys(GOALS)} value={f.goal} onChange={set('goal')} label="Goal" />
      </div>
      <div className="calc-out" aria-live="polite">
        {r ? (
          <>
            <p className="calc-kcal"><b>{r.kcal}</b><small> kcal / day</small></p>
            <p className="calc-sub">Maintenance {r.tdee} kcal · BMR {r.bmr} · BMI {r.bmi}</p>
            <ul className="calc-mac">
              <li><span>Protein</span><b>{r.p} g</b><i style={bar(r.p, 4)} /></li>
              <li><span>Carbs</span><b>{r.carb} g</b><i style={bar(r.carb, 4)} /></li>
              <li><span>Fat</span><b>{r.fat} g</b><i style={bar(r.fat, 9)} /></li>
            </ul>
            <p className="calc-sub">Water about {r.water} L a day. Weigh in weekly and adjust by 100–150 kcal if weight is not moving.</p>
          </>
        ) : <p className="calc-empty">Enter your age, height and weight to see your daily calories and macros.</p>}
      </div>
    </div>
  )
}
