const F = 'M10 150H230'
const bench = `${F}M28 134H142M40 134V150M130 134V150`
const hang = (y) => `M70 ${y}H170M70 ${y}V180M170 ${y}V180`
const st = { k: 'A', f: [110, 146] }

export const exercises = {
  Chest: [
    { n: 'Barbell bench press', s: '4 × 6–8', t: 'Shoulder blades pinned back, feet planted. Lower to mid chest, press up.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, 5, -90, -30, 75], q: 'bar', g: bench },
    { n: 'Incline dumbbell press', s: '3 × 8–12', t: 'Bench at 30–45°. Press up and slightly in, lower with control.', k: 'P', f: [110, 112], A: [-135, -80, -85, 0, 90], B: [-135, 50, -100, 0, 90], q: 'db', g: `${F}M126 128L66 68M92 119H136M104 119V150M128 119V150` },
    { n: 'Push-up', s: '3 × 12–15', t: 'Body in one straight line. Chest to the floor, elbows about 45°.', k: 'A', f: [50, 146], A: [-26, 90, 90, 154, 154], B: [-12, 165, 45, 168, 168], g: F },
    { n: 'Chest dip', s: '3 × 8–12', t: 'Lean forward slightly. Lower until elbows reach 90°, then push up.', k: 'W', f: [120, 95], A: [-80, 90, 90, 100, 150], B: [-65, 160, 45, 100, 150], g: `${F}M92 95H152M104 95V150M140 95V150` },
  ],
  Back: [
    { n: 'Deadlift', s: '3 × 5', t: 'Bar over mid-foot, brace your core. Push the floor away, lock hips at the top.', ...st, A: [-80, 90, 90, 95, 95], B: [-30, 90, 90, 15, 100], q: 'bar', g: F },
    { n: 'Lat pulldown', s: '3 × 10–12', t: 'Lean back slightly. Pull the bar to upper chest, elbows down and back.', k: 'P', f: [100, 112], A: [-100, -75, -80, 0, 90], B: [-100, 110, -10, 0, 90], q: 'cab', c: [132, 8], g: `${F}M70 119H120M96 119V150` },
    { n: 'Seated cable row', s: '3 × 10–12', t: 'Chest tall. Pull the handle to your belly and squeeze your shoulder blades.', k: 'P', f: [70, 128], A: [-92, 0, 0, 5, 5], B: [-96, 160, 5, 5, 5], q: 'cab', c: [228, 100], g: `${F}M44 134H100M60 134V150M146 100V150` },
    { n: 'Pull-up', s: '3 × max', t: 'Start from a dead hang. Pull your chest to the bar, lower under control.', k: 'W', f: [120, 22], A: [-90, -90, -90, 90, 150], B: [-90, -260, -80, 90, 150], v: '0 -10 240 190', g: hang(22) },
  ],
  Legs: [
    { n: 'Barbell squat', s: '4 × 6–8', t: 'Bar on upper back, chest up. Sit between your hips, knees track toes.', ...st, A: [-90, 60, -120, 90, 90], B: [-55, 60, -120, 8, 108], q: 'bar', g: F },
    { n: 'Romanian deadlift', s: '3 × 8–10', t: 'Soft knees, push hips back. Bar slides down your thighs, then drive hips forward.', ...st, A: [-85, 90, 90, 92, 92], B: [-20, 110, 110, 60, 100], q: 'bar', g: F },
    { n: 'Leg press', s: '3 × 10–12', t: 'Feet shoulder-width. Lower until knees reach 90°, never lock out hard.', k: 'P', f: [80, 110], A: [-135, 40, 20, -70, 20], B: [-135, 40, 20, -40, -40], q: 'ank', g: `${F}M90 122L44 76M118 104L140 44` },
    { n: 'Barbell hip thrust', s: '3 × 8–12', t: 'Upper back on a bench, drive through heels. Squeeze glutes hard at the top.', k: 'A', f: [120, 146], A: [-155, 15, 20, -30, 90], B: [-170, 15, 20, 0, 90], q: 'bar', g: `${F}M26 118H74M38 118V150M62 118V150` },
  ],
  Shoulders: [
    { n: 'Barbell overhead press', s: '4 × 6–8', t: 'Squeeze glutes and core. Press straight up, head through at the top.', ...st, A: [-90, 70, -110, 90, 90], B: [-90, -90, -90, 90, 90], q: 'bar', v: '0 -32 240 192', g: F },
    { n: 'Dumbbell front raise', s: '3 × 12', t: 'Slight bend in the elbows. Raise to shoulder height, lower slowly.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, -5, -5, 90, 90], q: 'db', g: F },
    { n: 'Face pull', s: '3 × 15', t: 'Pull the rope toward your forehead, elbows high. Pause and squeeze.', ...st, A: [-90, 0, 0, 90, 90], B: [-90, -170, -30, 90, 90], q: 'cab', c: [232, 34], g: F },
    { n: 'Upright row', s: '3 × 10–12', t: 'Pull the bar up along your body, elbows leading. Stop at chest height.', ...st, A: [-90, 90, 90, 90, 90], B: [-90, -30, 120, 90, 90], q: 'bar', g: F },
  ],
  Arms: [
    { n: 'Barbell curl', s: '3 × 8–10', t: 'Elbows pinned to your sides. Curl up, squeeze, lower for 2 seconds.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -80, 90, 90], q: 'bar', g: F },
    { n: 'Hammer curl', s: '3 × 10', t: 'Thumbs up, neutral grip. Curl without swinging your torso.', ...st, A: [-90, 92, 80, 90, 90], B: [-90, 92, -100, 90, 90], q: 'db', g: F },
    { n: 'Triceps rope pushdown', s: '3 × 10–12', t: 'Elbows fixed at your sides. Push down and spread the rope at the bottom.', ...st, A: [-90, 90, -35, 90, 90], B: [-90, 90, 80, 90, 90], q: 'cab', c: [128, 8], g: F },
    { n: 'Skull crusher', s: '3 × 10', t: 'Upper arms stay still. Lower the bar toward your forehead, extend back up.', k: 'P', f: [95, 128], A: [180, -90, -90, -30, 75], B: [180, -100, -190, -30, 75], q: 'bar', g: bench },
  ],
  Core: [
    { n: 'Plank', s: '3 × 45 s', t: 'Elbows under shoulders, body in one line. Squeeze glutes and keep breathing.', k: 'A', f: [50, 146], A: [-13, 90, 0, 167, 167], B: [-16, 90, 0, 164, 164], g: F },
    { n: 'Crunch', s: '3 × 15', t: 'Lower back stays down. Lift your shoulder blades, exhale, lower slowly.', k: 'P', f: [110, 141], A: [180, -165, 30, -50, 75], B: [215, -165, 30, -50, 75], g: F },
    { n: 'Hanging knee raise', s: '3 × 12', t: 'Hang with a firm grip. Lift knees to hip height without swinging.', k: 'W', f: [120, 12], A: [-90, -90, -90, 95, 110], B: [-100, -90, -90, 10, 100], v: '0 -10 240 190', g: hang(12) },
    { n: 'Lying leg raise', s: '3 × 12', t: 'Press your lower back down. Raise straight legs to vertical, lower slowly.', k: 'P', f: [110, 142], A: [180, 0, 0, 0, 0], B: [180, 0, 0, -85, -85], g: F },
  ],
}

const R = Math.PI / 180
const d = (a, l) => [Math.cos(a * R) * l, Math.sin(a * R) * l]
const add = (p, q) => [p[0] + q[0], p[1] + q[1]]

const ease = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x)
const SEG = [[1.1, 'up'], [0.35, 'top'], [1.9, 'down'], [0.45, 'bot']]
export const DUR = SEG.reduce((a, [t]) => a + t, 0)

export const frames = (ex, n = 24) => {
  const pose = (t) => {
    const p = ex.A.map((a, i) => a + (ex.B[i] - a) * t)
    const P = [0, 0]
    const N = add(P, d(p[0], 44))
    const E = add(N, d(p[1], 26))
    const W = add(E, d(p[2], 24))
    const K = add(P, d(p[3], 34))
    const A = add(K, d(p[4], 34))
    const o = { P, N, E, W, A }[ex.k]
    const m = (q) => [+(q[0] + ex.f[0] - o[0]).toFixed(1), +(q[1] + ex.f[1] - o[1]).toFixed(1)]
    return { P: m(P), N: m(N), E: m(E), W: m(W), K: m(K), A: m(A), H: m(add(N, d(p[0], 13))), F: m(add(A, [10, 0])) }
  }
  const out = []
  let at = 0
  SEG.forEach(([len, kind]) => {
    if (kind === 'up' || kind === 'down') {
      for (let i = kind === 'up' ? 0 : 1; i <= n; i++) {
        const e = ease(i / n)
        out.push({ ...pose(kind === 'up' ? e : 1 - e), kt: (at + (i / n) * len) / DUR })
      }
    } else {
      out.push({ ...pose(kind === 'top' ? 1 : 0), kt: (at + len) / DUR })
    }
    at += len
  })
  out[out.length - 1].kt = 1
  return out
}
