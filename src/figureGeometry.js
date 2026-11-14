import { exercises, poseAt } from './exercises'

const f = (n) => +n.toFixed(2)

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
  Back: ['torsoBackM', 'upperM'],
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

// ---- anatomical limb contours -------------------------------------------------
const unit = (a, b) => { const dx = b[0] - a[0]; const dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L, L] }
const at = (p, u, k) => [p[0] + u[0] * k, p[1] + u[1] * k]
const sample = (pr, t) => {
  if (t <= pr[0][0]) return pr[0]
  for (let i = 1; i < pr.length; i++) {
    if (t <= pr[i][0]) { const p = pr[i - 1]; const q = pr[i]; const u = (t - p[0]) / (q[0] - p[0]); return [t, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u] }
  }
  return pr[pr.length - 1]
}
// profile rows: [t along the limb, half-width on the front side, half-width on the back side]
const sides = (a, b, pr, fs, t0 = 0, t1 = 1, kf = 1, kb = 1) => {
  const [ux, uy] = unit(a, b)
  const fv = fs > 0 ? [uy, -ux] : [-uy, ux]
  const F = []
  const B = []
  for (let i = 0; i <= 8; i++) {
    const t = t0 + ((t1 - t0) * i) / 8
    const w = sample(pr, t)
    const c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    F.push([c[0] + fv[0] * w[1] * kf, c[1] + fv[1] * w[1] * kf])
    B.push([c[0] - fv[0] * w[2] * kb, c[1] - fv[1] * w[2] * kb])
  }
  return { F, B, fv, n: [-uy, ux] }
}
const sm = (pts) => {
  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}
const limb = (a, b, pr, fs, t0, t1, kf, kb) => {
  const { F, B, fv, n } = sides(a, b, pr, fs, t0, t1, kf, kb)
  const sw = fv[0] * n[0] + fv[1] * n[1] > 0 ? 0 : 1
  const fe = F[8]
  const be = B[8]
  const r1 = (Math.hypot(fe[0] - be[0], fe[1] - be[1]) / 2) * 1.002
  const r0 = (Math.hypot(F[0][0] - B[0][0], F[0][1] - B[0][1]) / 2) * 1.002
  return `M${f(F[0][0])} ${f(F[0][1])}${sm(F)}A${f(r1)} ${f(r1)} 0 0 ${sw} ${f(be[0])} ${f(be[1])}${sm([...B].reverse())}A${f(r0)} ${f(r0)} 0 0 ${sw} ${f(F[0][0])} ${f(F[0][1])}Z`
}
const edge = (a, b, pr, fs) => {
  const { F, B, fv } = sides(a, b, pr, fs, 0.14, 0.88, 0.84, 0.84)
  const p = -fv[0] * 0.7 - fv[1] * 0.7 > 0 ? F : B
  return `M${f(p[0][0])} ${f(p[0][1])}${sm(p)}`
}

const TORSO = [[0, 7.4, 8.2], [0.12, 8.0, 9.4], [0.38, 6.6, 6.4], [0.62, 9.4, 8.0], [0.82, 10.0, 8.8], [1, 6.2, 6.6]]
const THIGH = [[0, 8.2, 8.4], [0.2, 8.8, 8.8], [0.5, 7.2, 6.8], [0.8, 5.8, 5.4], [1, 4.9, 4.9]]
const SHIN = [[0, 4.9, 4.9], [0.18, 4.4, 5.8], [0.35, 4.0, 6.0], [0.7, 3.4, 4.2], [1, 2.9, 3.0]]
const UPPER = [[0, 5.6, 5.6], [0.3, 5.3, 5.0], [0.55, 4.8, 4.4], [1, 3.7, 3.7]]
const FORE = [[0, 3.9, 4.0], [0.25, 4.3, 4.2], [0.65, 3.0, 3.1], [1, 2.4, 2.4]]
const HAND = [[0, 2.4, 2.4], [0.5, 3.0, 3.0], [1, 2.0, 2.0]]
const NECK = [[0, 3.6, 3.5], [1, 3.3, 3.4]]
const HEAD = [[0, 3.4, 3.0], [0.15, 5.6, 4.6], [0.4, 7.0, 7.2], [0.7, 7.4, 7.6], [0.9, 5.8, 6.0], [1, 3.2, 3.2]]

const shoe = (A) => {
  const [x, y] = A
  const p = (dx, dy) => `${f(x + dx)} ${f(y + dy)}`
  return `M${p(-3.4, -2.2)}C${p(-3.6, -0.2)} ${p(-3.6, 2.8)} ${p(-2.4, 4.1)}L${p(9.6, 4.1)}C${p(11.4, 4.1)} ${p(11.6, 1.4)} ${p(9.6, 0.4)}C${p(6, -0.8)} ${p(3.6, -1.6)} ${p(2.6, -3)}Z`
}

// Every animated shape for one pose, keyed by name.
export const shapes = (ex, r, act, prog) => {
  const s = {}
  const ax = unit(r.P, r.N)
  s.torso = limb(r.P, r.N, TORSO, -1)
  s.torsoH = edge(r.P, r.N, TORSO, -1)
  s.neck = limb(at(r.N, ax, 1), at(r.N, ax, 12), NECK, -1)
  const h0 = at(r.N, ax, 4.5)
  const h1 = at(r.N, ax, 21.5)
  s.head = limb(h0, h1, HEAD, -1)
  s.headH = edge(h0, h1, HEAD, -1)
  s.thigh = limb(r.P, r.K, THIGH, 1)
  s.thighH = edge(r.P, r.K, THIGH, 1)
  s.shin = limb(r.K, r.A, SHIN, 1)
  s.shinH = edge(r.K, r.A, SHIN, 1)
  s.foot = shoe(r.A)
  if (r.K2) {
    s.thigh2 = limb(r.P, r.K2, THIGH, 1)
    s.shin2 = limb(r.K2, r.A2, SHIN, 1)
    s.foot2 = shoe(r.A2)
  }
  s.upper = limb(r.N, r.E, UPPER, 1)
  s.upperH = edge(r.N, r.E, UPPER, 1)
  s.fore = limb(r.E, r.W, FORE, 1)
  s.foreH = edge(r.E, r.W, FORE, 1)
  const hu = unit(r.E, r.W)
  s.hand = limb(at(r.W, hu, -3), at(r.W, hu, 3.4), HAND, 1)
  // muscle bellies that light up
  s.torsoUpM = limb(r.P, r.N, TORSO, -1, 0.5, 0.95, 0.9, 0.12)
  s.torsoBackM = limb(r.P, r.N, TORSO, -1, 0.45, 0.95, 0.12, 0.9)
  s.torsoLowM = limb(r.P, r.N, TORSO, -1, 0.1, 0.52, 0.85, 0.18)
  s.thighM = limb(r.P, r.K, THIGH, 1, 0.12, 0.88, 0.86, 0.8)
  s.shinM = limb(r.K, r.A, SHIN, 1, 0.1, 0.62, 0.3, 0.9)
  s.upperM = limb(r.N, r.E, UPPER, 1, 0.15, 0.9, 0.86, 0.6)
  s.foreM = limb(r.E, r.W, FORE, 1, 0.1, 0.85, 0.8, 0.8)
  s.delt = circ(r.N, 5.6)
  s.glute = circ(mix(r.P, r.K, 0.12), 7)
  s.hex = hex(r.W, 7.6)
  s.H = r.H
  s.W = r.W
  s.A = r.A
  s.shadow = shadowOf(ex, r)
  s.act = 0.14 + 0.86 * act
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
  Object.keys(r).forEach((k) => { o[k] = Array.isArray(r[k]) ? [r[k][0], +(r[k][1] - over).toFixed(2)] : r[k] })
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
