import { useEffect, useId, useMemo, useRef } from 'react'
import { exercises, frames, DUR } from './exercises'
import './figure.css'

/* ------------------------------------------------------------------ *
 * Premium exercise figure.
 * Re-uses the joint data already in exercises.js (frames()) but draws a
 * shaded, tapered "studio mannequin" instead of a stick figure, with
 *   - the target muscle glowing ember-red (like the reference reels)
 *   - a green dashed bar path + arrow
 *   - a faint ghost of the mid-rep position behind the figure
 *   - polished floor, contact shadow and soft light
 * Pure SVG + SMIL, no new dependencies, no assets.
 * ------------------------------------------------------------------ */

const f1 = (n) => +n.toFixed(1)
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const unit = (a, b) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l = Math.hypot(dx, dy) || 1
  return [dx / l, dy / l]
}

// Tapered capsule from p1 (radius r1) to p2 (radius r2). Every call returns
// the same command structure, so SMIL can animate the "d" attribute.
const limb = (p1, p2, r1, r2) => {
  const [ux, uy] = unit(p1, p2)
  const nx = -uy
  const ny = ux
  const a = [p1[0] + nx * r1, p1[1] + ny * r1]
  const b = [p2[0] + nx * r2, p2[1] + ny * r2]
  const c = [p2[0] - nx * r2, p2[1] - ny * r2]
  const e = [p1[0] - nx * r1, p1[1] - ny * r1]
  return `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}A${r2} ${r2} 0 0 0 ${f1(c[0])} ${f1(c[1])}L${f1(e[0])} ${f1(e[1])}A${r1} ${r1} 0 0 0 ${f1(a[0])} ${f1(a[1])}Z`
}

// Thin lighter capsule on the lit side of a limb, gives a rounded 3D feel.
const rim = (p1, p2, r1, r2) => {
  const [ux, uy] = unit(p1, p2)
  let nx = -uy
  let ny = ux
  if (ny > 0.25 || (Math.abs(ny) <= 0.25 && nx > 0)) { nx = -nx; ny = -ny }
  const k = 0.4
  return limb([p1[0] + nx * r1 * k, p1[1] + ny * r1 * k], [p2[0] + nx * r2 * k, p2[1] + ny * r2 * k], r1 * 0.36, r2 * 0.36)
}

// A slice of the torso (t0..t1 from hips to shoulders).
const zone = (p, q, t0, t1) => {
  const r = (t) => Math.max(2, 10 + 1.5 * t - 1.6)
  return limb(lerp(p, q, t0), lerp(p, q, t1), r(t0), r(t1))
}

const muscle = (f, g) => {
  switch (g) {
    case 'Chest': return zone(f.P, f.N, 0.5, 0.97)
    case 'Back': return zone(f.P, f.N, 0.25, 0.93)
    case 'Core': return zone(f.P, f.N, 0.02, 0.55)
    case 'Arms': return limb(f.N, f.E, 5.6, 4.5)
    case 'Shoulders': return limb(f.N, lerp(f.N, f.E, 0.38), 7.6, 6.8)
    default: return limb(f.P, f.K, 8.4, 5.8) // Legs, Cardio
  }
}

const parts = (f, g) => {
  const o = {
    torso: limb(f.P, f.N, 10, 11.5),
    thigh: limb(f.P, f.K, 9.5, 6.6),
    shin: limb(f.K, f.A, 6.6, 4.6),
    foot: limb(f.A, f.F, 4.6, 3.4),
    neck: limb(f.N, f.H, 3.8, 3.4),
    up: limb(f.N, f.E, 6.6, 5.2),
    fore: limb(f.E, f.W, 5.2, 3.9),
    rimT: rim(f.P, f.N, 10, 11.5),
    rimH: rim(f.P, f.K, 9.5, 6.6),
    rimU: rim(f.N, f.E, 6.6, 5.2),
    mus: muscle(f, g),
  }
  if (f.K2) {
    o.rthigh = limb(f.P, f.K2, 9, 6.3)
    o.rshin = limb(f.K2, f.A2, 6.3, 4.4)
  }
  return o
}

const groupOf = (ex) => Object.keys(exercises).find((g) => exercises[g].includes(ex)) || 'Chest'

const labelOf = (ex, g) => {
  if (g === 'Arms') {
    if (/curl|hammer|chin/i.test(ex.n)) return 'Biceps'
    if (/tricep|dip|skull|pushdown|kickback|close/i.test(ex.n)) return 'Triceps'
    return 'Arms'
  }
  return g === 'Cardio' ? 'Full body' : g
}

export default function Figure({ ex, group }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const svgRef = useRef(null)
  const g = group || groupOf(ex)
  const still = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const fr = useMemo(() => frames(ex, 12), [ex])
  const all = useMemo(() => fr.map((f) => parts(f, g)), [fr, g])
  const midIdx = Math.max(0, fr.findIndex((f) => f.kt >= 1.1 / DUR))
  const base = still ? midIdx : 0
  const kt = fr.map((f) => f.kt.toFixed(4)).join(';')
  const ghost = all[midIdx]

  // pause the animation while the card is off screen
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !svg.pauseAnimations || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()), { threshold: 0 })
    io.observe(svg)
    return () => io.disconnect()
  }, [])

  const an = (attr, get) => (still ? null : (
    <animate attributeName={attr} values={fr.map((f, i) => get(f, i)).join(';')} keyTimes={kt} dur={`${DUR}s`} repeatCount="indefinite" />
  ))
  const PATH = (key, props) => (
    <path d={all[base][key]} {...props}>{an('d', (f, i) => all[i][key])}</path>
  )
  const DOT = (key, r, props) => (
    <circle r={r} cx={fr[base][key][0]} cy={fr[base][key][1]} {...props}>
      {an('cx', (f) => f[key][0])}
      {an('cy', (f) => f[key][1])}
    </circle>
  )

  const tk = ex.q === 'ank' ? 'A' : 'W'
  const trail = fr.filter((_, i) => i % 2 === 0).map((f) => f[tk].join(',')).join(' ')
  const iu = Math.max(1, fr.findIndex((f) => f.kt >= 1.1 / DUR - 1e-6))
  const tip = fr[iu][tk]
  const prev = fr[Math.max(0, iu - 3)][tk]
  const move = Math.hypot(tip[0] - prev[0], tip[1] - prev[1])
  const [ax, ay] = unit(prev, tip)
  const arrow = [
    [tip[0] + ax * 6, tip[1] + ay * 6],
    [tip[0] - ax * 3 - ay * 4.5, tip[1] - ay * 3 + ax * 4.5],
    [tip[0] - ax * 3 + ay * 4.5, tip[1] - ay * 3 - ax * 4.5],
  ].map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ')

  const vb = (ex.v || '0 0 240 160').split(' ').map(Number)
  const floorY = 150
  const avgX = f1(fr.reduce((s, f) => s + f.P[0], 0) / fr.length)
  const label = labelOf(ex, g)
  const pillW = Math.round(label.length * 4.3 + 18)
  const musOver = g === 'Arms' || g === 'Shoulders'
  const id = (n) => `${uid}-${n}`
  const url = (n) => `url(#${id(n)})`
  const edge = { stroke: '#000', strokeOpacity: 0.32, strokeWidth: 0.5, strokeLinejoin: 'round' }

  const musLayer = (
    <g>
      {PATH('mus', { fill: '#ff3d1f', opacity: 0.28, stroke: '#ff6a3d', strokeOpacity: 0.45, strokeWidth: 3, strokeLinejoin: 'round' })}
      <g>
        {PATH('mus', { fill: url('ember') })}
        {!still && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />}
      </g>
    </g>
  )

  return (
    <svg ref={svgRef} className="fig mq" viewBox={ex.v || '0 0 240 160'} role="img" aria-label={`${ex.n} animated demonstration, targets ${label.toLowerCase()}`}>
      <defs>
        <linearGradient id={id('skin')} gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="200" y2="170">
          <stop offset="0" stopColor="#fbf8ef" />
          <stop offset=".5" stopColor="#d7d0c0" />
          <stop offset="1" stopColor="#8a8375" />
        </linearGradient>
        <radialGradient id={id('head')} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#d9d2c3" />
          <stop offset="1" stopColor="#8a8375" />
        </radialGradient>
        <linearGradient id={id('ember')} gradientUnits="userSpaceOnUse" x1="60" y1="20" x2="180" y2="150">
          <stop offset="0" stopColor="#ff9a5c" />
          <stop offset=".5" stopColor="#ff4a24" />
          <stop offset="1" stopColor="#b81d0b" />
        </linearGradient>
        <radialGradient id={id('plate')} cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#6b707b" />
          <stop offset=".6" stopColor="#262a31" />
          <stop offset="1" stopColor="#101216" />
        </radialGradient>
        <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8b983" stopOpacity=".26" />
          <stop offset="1" stopColor="#d8b983" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('shadow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".7" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('glow')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#d8b983" stopOpacity=".28" />
          <stop offset="1" stopColor="#d8b983" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* polished floor + light pool + contact shadow */}
      <rect x={vb[0] - 20} y={floorY} width={vb[2] + 40} height={vb[1] + vb[3] - floorY + 20} fill={url('floor')} />
      <ellipse cx={avgX} cy={floorY} rx="74" ry="9" fill={url('glow')} />
      <ellipse cx={avgX} cy={floorY + 1} rx="46" ry="4.4" fill={url('shadow')} />

      {/* ghost of the mid-rep position (like the red ghost in the reference) */}
      <g fill="#ff6a3d" opacity=".16">
        {['rthigh', 'rshin', 'thigh', 'shin', 'foot', 'torso', 'up', 'fore'].map((k) => (ghost[k] ? <path key={k} d={ghost[k]} /> : null))}
      </g>

      {/* equipment: bench / rack / bar, metallic */}
      <path d={ex.g} fill="none" stroke="#14161a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d={ex.g} fill="none" stroke="#565b66" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* bar path */}
      {ex.q && (
        <g>
          <polyline points={trail} fill="none" stroke="#3dff8e" strokeOpacity=".22" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={trail} fill="none" stroke="#59f0a0" strokeOpacity=".9" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round">
            {!still && <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />}
          </polyline>
          {move > 3 && <polygon points={arrow} fill="#59f0a0" stroke="#0b3d22" strokeWidth=".6" strokeLinejoin="round" />}
        </g>
      )}

      {/* far leg */}
      {all[0].rthigh && (
        <g opacity=".55">
          {PATH('rthigh', { fill: url('skin'), ...edge })}
          {PATH('rshin', { fill: url('skin'), ...edge })}
        </g>
      )}

      {/* legs, torso */}
      {PATH('thigh', { fill: url('skin'), ...edge })}
      {PATH('shin', { fill: url('skin'), ...edge })}
      {PATH('foot', { fill: url('skin'), ...edge })}
      {PATH('torso', { fill: url('skin'), ...edge })}
      {PATH('rimH', { fill: '#fff', opacity: 0.22 })}
      {PATH('rimT', { fill: '#fff', opacity: 0.24 })}
      {!musOver && musLayer}

      {/* head + neck */}
      {PATH('neck', { fill: url('skin'), ...edge })}
      {DOT('H', 8.4, { fill: url('head'), ...edge })}

      {/* arm sits in front of the torso */}
      {PATH('up', { fill: url('skin'), ...edge })}
      {PATH('rimU', { fill: '#fff', opacity: 0.24 })}
      {PATH('fore', { fill: url('skin'), ...edge })}
      {musOver && musLayer}
      {DOT('W', 3.9, { fill: url('head'), ...edge })}

      {/* equipment in hand */}
      {ex.q === 'cab' && (
        <g>
          <line x1={fr[base].W[0]} y1={fr[base].W[1]} x2={ex.c[0]} y2={ex.c[1]} stroke="#9aa0ab" strokeOpacity=".7" strokeWidth="1.2">
            {an('x1', (f) => f.W[0])}
            {an('y1', (f) => f.W[1])}
          </line>
          <circle cx={ex.c[0]} cy={ex.c[1]} r="5" fill="#15171b" stroke="#d8b983" strokeWidth="1.4" />
          {DOT('W', 4.4, { fill: url('plate'), stroke: '#d8b983', strokeWidth: 1.4 })}
        </g>
      )}
      {ex.q === 'bar' && (
        <g>
          {DOT('W', 13, { fill: url('plate'), stroke: '#d8b983', strokeOpacity: 0.55, strokeWidth: 1.2 })}
          {DOT('W', 8.2, { fill: 'none', stroke: '#000', strokeOpacity: 0.5, strokeWidth: 1 })}
          {DOT('W', 2.6, { fill: '#e6dcc4' })}
        </g>
      )}
      {ex.q === 'db' && (
        <g>
          {DOT('W', 7.4, { fill: url('plate'), stroke: '#d8b983', strokeOpacity: 0.55, strokeWidth: 1 })}
          {DOT('W', 2.2, { fill: '#e6dcc4' })}
        </g>
      )}
      {ex.q === 'ank' && (
        <g>
          {DOT('A', 11, { fill: url('plate'), stroke: '#d8b983', strokeOpacity: 0.55, strokeWidth: 1.2 })}
          {DOT('A', 2.6, { fill: '#e6dcc4' })}
        </g>
      )}

      {/* target-muscle tag */}
      <g transform={`translate(${vb[0] + vb[2] - pillW - 9} ${vb[1] + 9})`}>
        <rect width={pillW} height="11" rx="5.5" fill="#000" fillOpacity=".5" stroke="#d8b983" strokeOpacity=".4" strokeWidth=".6" />
        <circle cx="6.5" cy="5.5" r="2.1" fill="#ff4a24" />
        <text x="12" y="7.9" fontSize="5.6" fontWeight="700" letterSpacing=".7" fill="#f2e7cf" fontFamily="Manrope, system-ui, sans-serif">{label.toUpperCase()}</text>
      </g>
    </svg>
  )
}
