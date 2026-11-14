import { exercises, poseAt } from './exercises'

const f = (n) => +n.toFixed(1)

// Tapered limb: a capsule from circle a (radius ra) to circle b (radius rb).
export const cap = (a, ra, b, rb) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy) || 1
  const nx = -dy / L
  const ny = dx / L
  const p = (c, r, s) => `${f(c[0] + s * nx * r)} ${f(c[1] + s * ny * r)}`
  return `M${p(a, ra, 1)}L${p(b, rb, 1)}A${rb} ${rb} 0 0 0 ${p(b, rb, -1)}L${p(a, ra, -1)}A${ra} ${ra} 0 0 0 ${p(a, ra, 1)}Z`
}

// Soft rim light that runs along the lit side of a limb (light comes from the upper left).
export const rim = (a, ra, b, rb) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy) || 1
  const nx = -dy / L
  const ny = dx / L
  const s = -nx * 0.7 - ny * 0.7 > 0 ? 1 : -1
  const ux = dx / L
  const uy = dy / L
  const k = Math.min(0.22 * L, 7)
  const x1 = a[0] + s * nx * ra * 0.5 + ux * k
  const y1 = a[1] + s * ny * ra * 0.5 + uy * k
  const x2 = b[0] + s * nx * rb * 0.5 - ux * k
  const y2 = b[1] + s * ny * rb * 0.5 - uy * k
  return `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`
}

export const circ = (c, r) => `M${f(c[0] - r)} ${f(c[1])}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`

export const hex = (c, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6
    return `${i ? 'L' : 'M'}${f(c[0] + Math.cos(a) * r)} ${f(c[1] + Math.sin(a) * r)}`
  }).join('') + 'Z'

const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

// Which body parts glow for each muscle group.
const GLOW = {
  Chest: ['torsoUpM'],
  Back: ['torsoUpM', 'torsoLowM', 'upperM'],
  Shoulders: ['delt', 'upperM'],
  Arms: ['upperM', 'foreM'],
  Core: ['torsoLowM'],
  Legs: ['thighM', 'shinM', 'glute'],
  Cardio: ['torsoLowM', 'thighM', 'shinM'],
}

const groupOf = new Map()
Object.entries(exercises).forEach(([g, list]) => list.forEach((x) => groupOf.set(x.n, g)))
export const groupName = (ex) => groupOf.get(ex.n) || 'Cardio'
export const glowParts = (ex) => GLOW[groupName(ex)] || GLOW.Cardio

// Every animated shape for one pose, keyed by name.
export const shapes = (ex, r, act, prog) => {
  const C = mix(r.P, r.N, 0.62)
  const s = {}
  s.torsoLow = cap(r.P, 10.5, C, 12.5)
  s.torsoLowH = rim(r.P, 10.5, C, 12.5)
  s.torsoUp = cap(C, 12.5, r.N, 6.5)
  s.torsoUpH = rim(C, 12.5, r.N, 6.5)
  s.thigh = cap(r.P, 9, r.K, 6.4)
  s.thighH = rim(r.P, 9, r.K, 6.4)
  s.shin = cap(r.K, 6.4, r.A, 4.3)
  s.shinH = rim(r.K, 6.4, r.A, 4.3)
  s.foot = cap(r.A, 4.6, r.F, 3.1)
  if (r.K2) {
    const F2 = [r.A2[0] + 10, r.A2[1]]
    s.thigh2 = cap(r.P, 8.6, r.K2, 6.1)
    s.shin2 = cap(r.K2, 6.1, r.A2, 4.1)
    s.foot2 = cap(r.A2, 4.4, F2, 3)
  }
  s.upper = cap(r.N, 6.2, r.E, 4.7)
  s.upperH = rim(r.N, 6.2, r.E, 4.7)
  s.fore = cap(r.E, 4.7, r.W, 3.5)
  s.foreH = rim(r.E, 4.7, r.W, 3.5)
  // the muscle bellies that glow, narrower than the limbs they sit on
  s.torsoUpM = cap(mix(C, r.N, 0.08), 10.4, mix(C, r.N, 0.78), 7)
  s.torsoLowM = cap(mix(r.P, C, 0.18), 8, mix(r.P, C, 0.88), 9.6)
  s.thighM = cap(mix(r.P, r.K, 0.16), 7.4, mix(r.P, r.K, 0.84), 4.6)
  s.shinM = cap(mix(r.K, r.A, 0.1), 4.9, mix(r.K, r.A, 0.74), 3)
  s.upperM = cap(mix(r.N, r.E, 0.18), 4.3, mix(r.N, r.E, 0.86), 3.2)
  s.foreM = cap(mix(r.E, r.W, 0.14), 3.6, mix(r.E, r.W, 0.82), 2.3)
  s.delt = circ(r.N, 5.4)
  s.glute = circ(mix(r.P, r.K, 0.12), 8)
  s.hex = hex(r.W, 7.6)
  s.H = r.H
  s.W = r.W
  s.A = r.A
  s.shadow = shadowOf(ex, r)
  s.act = 0.3 + 0.7 * act
  s.prog = prog
  if (ex.q === 'cab') s.cab = `M${r.W[0]} ${r.W[1]}L${ex.c[0]} ${ex.c[1]}`
  return s
}

const shadowOf = (ex, r) => {
  const xs = [r.P[0], r.A[0], r.W[0]]
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const spread = (Math.max(...xs) - Math.min(...xs)) / 2
  const air = Math.min(1, (r.lift || 0) / 26)
  return { cx: f(cx), rx: f((26 + spread * 0.8) * (1 - air * 0.45)), o: f(0.55 * (1 - air * 0.6)) }
}

// Turn the exercise's floor/equipment path into styled pieces.
export const equipment = (g) => {
  const out = { floor: null, pads: [], frames: [], bars: [], posts: [] }
  const re = /([MHVL])\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?/g
  let cur = [0, 0]
  let start = [0, 0]
  let m
  const segs = []
  while ((m = re.exec(g))) {
    const [, c, a, b] = m
    if (c === 'M') { cur = [+a, +b]; start = cur; continue }
    const to = c === 'H' ? [+a, cur[1]] : c === 'V' ? [cur[0], +a] : [+a, +b]
    segs.push({ x1: cur[0], y1: cur[1], x2: to[0], y2: to[1], from: start })
    cur = to
  }
  segs.forEach((sg) => {
    const horiz = sg.y1 === sg.y2
    const vert = sg.x1 === sg.x2
    const len = Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1)
    if (horiz && sg.y1 >= 149 && len > 150) out.floor = sg
    else if (horiz && sg.y1 < 60) out.bars.push(sg)
    else if (vert && len > 40 && Math.max(sg.y1, sg.y2) >= 178) out.posts.push(sg)
    else if (vert) out.frames.push(sg)
    else out.pads.push(sg)
  })
  return out
}

export const parseViewBox = (v) => (v || '0 0 240 160').split(/\s+/).map(Number)

// Path of one joint across the whole movement, drawn as a faint guide.
export const trailOf = (ex, key) => {
  const pts = []
  for (let i = 0; i <= 28; i++) pts.push(poseAt(ex, i / 28)[key].join(','))
  return pts.join(' ')
}


const dist = (p, a, b) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L2 = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

// Everything about an exercise that does not change while it plays.
export const stageOf = (ex) => {
  const eq = equipment(ex.g)
  const vb = fit(ex, parseViewBox(ex.v), eq.floor ? eq.floor.y1 : null)
  const mid = poseAt(ex, 0.5)
  const supported = ex.k === 'P'

  // Lying and seated lifts: slide the pad out from under the stick-figure's spine so the body rests on it.
  if (supported) {
    const kx = mid.K[0] - mid.P[0]
    const ky = mid.K[1] - mid.P[1]
    const kl = Math.hypot(kx, ky) || 1
    eq.pads = eq.pads.map((sg) => {
      const dx = sg.x2 - sg.x1
      const dy = sg.y2 - sg.y1
      const L = Math.hypot(dx, dy) || 1
      let n = [-dy / L, dx / L]
      const dn = (v) => (v[0] * kx + v[1] * ky) / kl
      const a = dn(n)
      const b = dn([-n[0], -n[1]])
      if (Math.abs(a - b) < 0.05 ? n[1] < 0 : b < a) n = [-n[0], -n[1]]
      let near = 1e9
      for (let i = 0; i <= 8; i++) near = Math.min(near, dist(mix(mid.P, mid.N, i / 8), [sg.x1, sg.y1], [sg.x2, sg.y2]))
      const push = Math.max(0, 14.5 - near)
      return { ...sg, x1: sg.x1 + n[0] * push, y1: sg.y1 + n[1] * push, x2: sg.x2 + n[0] * push, y2: sg.y2 + n[1] * push, oy: sg.y1, dy: n[1] * push, supported: true }
    })
    eq.frames = eq.frames.map((fr) => {
      const top = Math.min(fr.y1, fr.y2)
      const pad = eq.pads.find((p) => p.y1 - p.dy === p.oy && Math.abs(p.oy - top) < 1 && Math.abs(p.y1 - p.y2) < 0.01 && fr.x1 >= Math.min(p.x1, p.x2) - 1 && fr.x1 <= Math.max(p.x1, p.x2) + 1)
      return pad ? { ...fr, y1: pad.y1, y2: Math.max(fr.y1, fr.y2) } : fr
    })
  }

  const tk = ex.q === 'ank' ? 'A' : 'W'
  return {
    vb,
    eq,
    supported,
    floorY: eq.floor ? eq.floor.y1 : null,
    trail: ex.q ? trailOf(ex, tk) : null,
    tk,
    ghost: ['W', 'E', 'N', 'P', 'K', 'A', 'F'].map((k) => mid[k].join(',')).join(' '),
    glow: glowParts(ex),
  }
}

// Keep the whole body above the floor even when thick limbs would sink into it.
export const settle = (r, floorY) => {
  if (floorY == null) return r
  const parts = [['P', 9.5], ['N', 6], ['K', 5.6], ['A', 4.6], ['F', 3.2], ['W', 4], ['E', 4.2], ['K2', 5.6], ['A2', 4.4]]
  let over = 0
  parts.forEach(([k, rad]) => { if (r[k]) over = Math.max(over, r[k][1] + rad - (floorY + 0.8)) })
  if (over <= 0.3) return r
  const o = {}
  Object.keys(r).forEach((k) => { o[k] = Array.isArray(r[k]) ? [r[k][0], +(r[k][1] - over).toFixed(1)] : r[k] })
  return o
}

// Grow the view box when a movement would leave the frame (overhead presses, jumps).
const fit = (ex, vb, floorY) => {
  let top = 1e9
  let left = 1e9
  let right = -1e9
  const reach = [['P', 10], ['N', 8], ['E', 6], ['W', ex.q === 'bar' ? 15 : 9], ['K', 7], ['A', 6], ['F', 4], ['H', 10], ['K2', 7], ['A2', 6]]
  for (let i = 0; i <= 20; i++) {
    const r = settle(poseAt(ex, i / 20), floorY)
    reach.forEach(([k, rad]) => {
      if (!r[k]) return
      top = Math.min(top, r[k][1] - rad)
      left = Math.min(left, r[k][0] - rad)
      right = Math.max(right, r[k][0] + rad)
    })
  }
  const [x, y, w, h] = vb
  const ny = Math.min(y, Math.floor(top - 6))
  return [left < x + 4 || right > x + w - 4 ? Math.min(x, Math.floor(left - 8)) : x, ny, left < x + 4 || right > x + w - 4 ? Math.max(w, Math.ceil(right + 8 - Math.min(x, left - 8))) : w, h + (y - ny)]
}
