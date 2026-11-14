import { useEffect, useId, useMemo, useRef } from 'react'
import { DUR, phaseAt, poseAt } from './exercises'
import { settle, shapes, stageOf } from './figureGeometry'
import './figure.css'

const GOLD = '#d8b983'
const GOLD_HI = '#f6e4bd'

// One shared animation loop for every figure on screen.
const subs = new Set()
let raf = 0
const loop = (now) => {
  subs.forEach((fn) => fn(now))
  raf = subs.size ? requestAnimationFrame(loop) : 0
}
const subscribe = (fn) => {
  subs.add(fn)
  if (!raf) raf = requestAnimationFrame(loop)
  return () => { subs.delete(fn) }
}

const frameAt = (ex, stage, time) => {
  const { t, act } = phaseAt(time)
  const r = settle(poseAt(ex, t), stage.floorY)
  const barW = stage.vb[2] - 36
  const s = shapes(ex, r, act, +((time / DUR) * barW).toFixed(1))
  if (stage.trail) {
    const p = [0, 1, 2, 3, 4].map((i) => poseAt(ex, phaseAt((((time - i * 0.09) % DUR) + DUR) % DUR).t)[stage.tk])
    for (let i = 0; i < 4; i++) s[`tl${i}`] = `M${p[i][0]} ${p[i][1]}L${p[i + 1][0]} ${p[i + 1][1]}`
  }
  return s
}

const apply = (nodes, s) => {
  for (let i = 0; i < nodes.length; i++) {
    const [el, k, type] = nodes[i]
    const v = s[k]
    if (v == null) continue
    if (type === 'd') el.setAttribute('d', v)
    else if (type === 'c') { el.setAttribute('cx', v[0]); el.setAttribute('cy', v[1]) }
    else if (type === 'o') el.setAttribute('opacity', v.toFixed(2))
    else if (type === 'w') el.setAttribute('width', v)
    else if (type === 'sh') { el.setAttribute('cx', v.cx); el.setAttribute('rx', v.rx); el.setAttribute('opacity', v.o) }
  }
}

export default function Figure({ ex, at }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const svg = useRef(null)
  const stage = useMemo(() => stageOf(ex), [ex])
  const first = at ?? 0.72
  const S = useMemo(() => frameAt(ex, stage, first), [ex, stage, first])
  const still = at != null || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const root = svg.current
    if (!root || still) return undefined
    const nodes = [...root.querySelectorAll('[data-k]')].map((el) => [el, el.dataset.k, el.dataset.t])
    let visible = true
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.01 })
    io?.observe(root)
    const begin = performance.now() - first * 1000
    const off = subscribe((now) => {
      if (!visible) return
      apply(nodes, frameAt(ex, stage, (((now - begin) / 1000) % DUR + DUR) % DUR))
    })
    return () => { off(); io?.disconnect() }
  }, [ex, stage, still, first])

  const { vb, eq, floorY, glow } = stage
  const [vx, vy, vw, vh] = vb
  const id = (n) => `${n}${uid}`
  const url = (n) => `url(#${id(n)})`
  const barY = vy + vh - 7

  const Pad = ({ sg }) => {
    const dx = sg.x2 - sg.x1
    const dy = sg.y2 - sg.y1
    const L = Math.hypot(dx, dy) || 1
    const nx = -dy / L
    const ny = dx / L
    const s = -nx * 0.7 - ny * 0.7 > 0 ? 1 : -1
    const ox = s * nx * 2.6
    const oy = s * ny * 2.6
    const ix = (dx / L) * 4
    const iy = (dy / L) * 4
    return (
      <g>
        <path className="fx-pad" d={`M${sg.x1} ${sg.y1}L${sg.x2} ${sg.y2}`} strokeWidth={sg.supported ? 9 : 5.4} />
        <path className="fx-pad-hl" d={`M${sg.x1 + ox + ix} ${sg.y1 + oy + iy}L${sg.x2 + ox - ix} ${sg.y2 + oy - iy}`} />
        {sg.supported && <path className="fx-stitch" d={`M${sg.x1 - ox * 0.2 + ix} ${sg.y1 - oy * 0.2 + iy}L${sg.x2 - ox * 0.2 - ix} ${sg.y2 - oy * 0.2 - iy}`} />}
      </g>
    )
  }

  const limb = (k, extra) => <path key={k + (extra || '')} data-t="d" data-k={k} d={S[k]} />
  const rimOf = (k) => <path key={`${k}H`} className="fx-rim" data-t="d" data-k={`${k}H`} d={S[`${k}H`]} />
  const arm = [limb('upper'), limb('fore'), limb('hand')]
  const legNear = [limb('thigh'), limb('shin'), limb('foot')]
  const legFar = ex.A.length > 5 ? [limb('thigh2'), limb('shin2'), limb('foot2')] : null

  return (
    <svg ref={svg} className="fig fx" viewBox={vb.join(' ')} role="img" aria-label={`${ex.n} animated demonstration`}>
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2=".85" y2="1">
          <stop offset="0" stopColor="#868d9a" /><stop offset=".38" stopColor="#4a505b" /><stop offset="1" stopColor="#16181d" />
        </linearGradient>
        <linearGradient id={id('far')} x1="0" y1="0" x2=".85" y2="1">
          <stop offset="0" stopColor="#3b3f48" /><stop offset="1" stopColor="#0d0e11" />
        </linearGradient>
        <linearGradient id={id('mus')} x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#e9cf98" /><stop offset=".55" stopColor="#a98245" /><stop offset="1" stopColor="#5e4420" />
        </linearGradient>
        <radialGradient id={id('head')} cx=".34" cy=".3" r=".85">
          <stop offset="0" stopColor="#7b818d" /><stop offset=".5" stopColor="#363a43" /><stop offset="1" stopColor="#15171b" />
        </radialGradient>
        <radialGradient id={id('plate')} cx=".34" cy=".3" r=".9">
          <stop offset="0" stopColor="#6b717d" /><stop offset=".55" stopColor="#2b2e35" /><stop offset="1" stopColor="#0f1013" />
        </radialGradient>
        <radialGradient id={id('hub')} cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#fff4d6" /><stop offset=".55" stopColor={GOLD} /><stop offset="1" stopColor="#8a6a30" />
        </radialGradient>
        <radialGradient id={id('spot')} cx=".5" cy=".36" r=".75">
          <stop offset="0" stopColor={GOLD} stopOpacity=".2" /><stop offset=".55" stopColor={GOLD} stopOpacity=".05" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('sh')} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".85" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('floor')} gradientUnits="userSpaceOnUse" x1="0" y1={floorY ?? 150} x2="0" y2={(floorY ?? 150) + 40}>
          <stop offset="0" stopColor={GOLD} stopOpacity=".16" /><stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('line')} gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="230" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset=".5" stopColor={GOLD_HI} stopOpacity=".9" /><stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('fade')} gradientUnits="userSpaceOnUse" x1="0" y1={floorY ?? 150} x2="0" y2={(floorY ?? 150) + 34}>
          <stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#000" />
        </linearGradient>
        <filter id={id('blur')} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6" /></filter>
        <mask id={id('refl')} maskUnits="userSpaceOnUse" x={vx - 300} y={floorY ?? 150} width={vw + 600} height="44">
          <rect x={vx - 300} y={floorY ?? 150} width={vw + 600} height="44" fill={url('fade')} />
        </mask>
      </defs>

      <rect className="fx-spot" x={vx - 300} y={vy - 100} width={vw + 600} height={vh + 200} fill={url('spot')} />

      {floorY != null && (
        <>
          <rect x={vx - 300} y={floorY} width={vw + 600} height={vh + 100} fill={url('floor')} />
          <g mask={`url(#${id('refl')})`} opacity=".2">
            <use href={`#${id('bodyG')}`} transform={`translate(0 ${floorY * 2}) scale(1 -1)`} />
          </g>
          <ellipse data-t="sh" data-k="shadow" cx={S.shadow.cx} cy={floorY + 1.4} rx={S.shadow.rx} ry="3.6" opacity={S.shadow.o} fill={url('sh')} />
          <line x1="10" y1={floorY} x2="230" y2={floorY} stroke={url('line')} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}

      {/* equipment */}
      <g className="fx-eq">
        {eq.posts.map((sg, i) => <path key={`po${i}`} className="fx-steel" d={`M${sg.x1} ${sg.y1}L${sg.x2} ${sg.y2}`} strokeWidth="5" />)}
        {eq.frames.map((sg, i) => (
          <g key={`fr${i}`}>
            <path className="fx-steel" d={`M${sg.x1} ${sg.y1}L${sg.x2} ${sg.y2}`} strokeWidth="4.2" />
            <path className="fx-steel-hl" d={`M${sg.x1 - 1} ${Math.min(sg.y1, sg.y2) + 1}L${sg.x2 - 1} ${Math.max(sg.y1, sg.y2) - 1}`} />
          </g>
        ))}
        {eq.bars.map((sg, i) => (
          <g key={`ba${i}`}>
            <path className="fx-chrome" d={`M${sg.x1} ${sg.y1}L${sg.x2} ${sg.y2}`} strokeWidth="3.6" />
            <path className="fx-chrome-hl" d={`M${sg.x1 + 3} ${sg.y1 - 0.9}L${sg.x2 - 3} ${sg.y2 - 0.9}`} />
          </g>
        ))}
        {eq.pads.map((sg, i) => {
          const block = sg.y1 === sg.y2 && sg.y1 >= 140 && !sg.supported
          if (block) return <rect key={`pa${i}`} className="fx-block" x={Math.min(sg.x1, sg.x2)} y={sg.y1 - 4.5} width={Math.abs(sg.x2 - sg.x1)} height={floorY - sg.y1 + 4.5} rx="2.2" />
          return <Pad key={`pa${i}`} sg={sg} />
        })}
        {ex.q === 'cab' && (
          <>
            <path className="fx-cable" data-t="d" data-k="cab" d={S.cab} />
            <circle className="fx-pulley" cx={ex.c[0]} cy={ex.c[1]} r="6" />
            <circle fill={url('hub')} cx={ex.c[0]} cy={ex.c[1]} r="2.2" />
          </>
        )}
      </g>

      {stage.trail && <polyline className="fx-trail" points={stage.trail} />}
      <polyline className="fx-ghost" points={stage.ghost} />

      {/* body, drawn back to front */}
      <g id={id('bodyG')}>
        <g className="fx-limbs fx-far" fill={url('far')} transform="translate(-3.2 -1.6)">
          {arm}
          {!legFar && legNear}
        </g>
        {legFar && <g className="fx-limbs fx-far" fill={url('far')}>{legFar}</g>}

        <g className="fx-limbs" fill={url('body')}>
          {limb('neck')}
          {limb('torso')}
          {legNear}
          <path data-t="d" data-k="head" d={S.head} fill={url('head')} />
          {arm}
        </g>
        <g className="fx-rims">
          {['torso', 'thigh', 'shin', 'upper', 'fore', 'head'].map(rimOf)}
        </g>

        <g opacity=".5" filter={url('blur')}>
          <g className="fx-aura" data-t="o" data-k="act" opacity={S.act}>
            {glow.map((k) => <path key={k} data-t="d" data-k={k} d={S[k]} />)}
          </g>
        </g>
        <g className="fx-mus" data-t="o" data-k="act" opacity={S.act} fill={url('mus')} fillOpacity=".8">
          {glow.map((k) => <path key={k} data-t="d" data-k={k} d={S[k]} />)}
        </g>

        {ex.q === 'bar' && (
          <g className="fx-plate">
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="13" fill={url('plate')} />
            <circle className="fx-ring" data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="9.6" />
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="4.2" fill={url('hub')} stroke="none" />
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="1.4" fill="#0c0d10" stroke="none" />
          </g>
        )}
        {ex.q === 'db' && (
          <g className="fx-plate">
            <path data-t="d" data-k="hex" d={S.hex} fill={url('plate')} />
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="3" fill={url('hub')} stroke="none" />
          </g>
        )}
        {ex.q === 'mac' && (
          <g className="fx-plate">
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="5.6" fill={url('plate')} />
            <circle data-t="c" data-k="W" cx={S.W[0]} cy={S.W[1]} r="2.2" fill={url('hub')} stroke="none" />
          </g>
        )}
        {ex.q === 'ank' && (
          <g className="fx-plate">
            <circle data-t="c" data-k="A" cx={S.A[0]} cy={S.A[1]} r="9.5" fill={url('plate')} />
            <circle className="fx-ring" data-t="c" data-k="A" cx={S.A[0]} cy={S.A[1]} r="6.4" />
            <circle data-t="c" data-k="A" cx={S.A[0]} cy={S.A[1]} r="2.6" fill={url('hub')} stroke="none" />
          </g>
        )}
      </g>

      {stage.trail && [0, 1, 2, 3].map((i) => <path key={`tl${i}`} className="fx-tail" data-t="d" data-k={`tl${i}`} d={S[`tl${i}`]} opacity={0.65 - i * 0.16} strokeWidth={2.6 - i * 0.5} />)}
      {stage.trail && <circle className="fx-halo" data-t="c" data-k={stage.tk} cx={S[stage.tk][0]} cy={S[stage.tk][1]} r="6" />}
      {stage.trail && <circle className="fx-tracer" data-t="c" data-k={stage.tk} cx={S[stage.tk][0]} cy={S[stage.tk][1]} r="2.4" />}

      <rect className="fx-track" x={vx + 18} y={barY} width={vw - 36} height="1.8" rx=".9" />
      <rect className="fx-fill" data-t="w" data-k="prog" x={vx + 18} y={barY} width={S.prog} height="1.8" rx=".9" />
    </svg>
  )
}
