import { useEffect, useRef, useState } from 'react'
import './preloader.css'

const PLATES = [
  { x: 150, w: 16, h: 156, t: 10 },
  { x: 132, w: 12, h: 130, t: 35 },
  { x: 118, w: 10, h: 104, t: 60 },
  { x: 106, w: 8, h: 80, t: 85 },
]

export default function Preloader() {
  const [pct, setPct] = useState(0)
  const [holding, setHolding] = useState(false)
  const [phase, setPhase] = useState('load')
  const root = useRef(null)
  const rig = useRef(null)
  const hold = useRef(false)
  const skip = useRef(false)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [])

  useEffect(() => {
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let loaded = document.readyState === 'complete'
    const onLoad = () => { loaded = true }
    window.addEventListener('load', onLoad)
    let p = 0
    let shown = -1
    let last = performance.now()
    let raf = 0
    let timers = []
    const tick = (now) => {
      const dt = now - last
      last = now
      const base = calm ? 600 : 2600
      p = Math.min(skip.current ? 1 : loaded ? 1 : 0.92, p + (dt * (hold.current ? 3.4 : 1)) / base)
      root.current?.style.setProperty('--p', String(p))
      const v = Math.floor(p * 100)
      if (v !== shown) { shown = v; setPct(v) }
      if (p >= 1) {
        setPhase('done')
        timers = [window.setTimeout(() => setPhase('out'), calm ? 80 : 520), window.setTimeout(() => setPhase('gone'), calm ? 300 : 1500)]
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      timers.forEach(window.clearTimeout)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') skip.current = true }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (phase === 'gone') document.documentElement.style.overflow = '' }, [phase])

  if (phase === 'gone') return null

  const tilt = (e) => {
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    if (rig.current) rig.current.style.transform = `perspective(900px) rotateZ(${x * 7}deg) rotateX(${-y * 14}deg) rotateY(${x * 16}deg)`
  }
  const press = (on) => { hold.current = on; setHolding(on) }

  return (
    <div
      ref={root}
      className={`pl${phase === 'out' ? ' out' : ''}${holding ? ' hold' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${pct} percent`}
      onPointerMove={tilt}
      onPointerDown={() => press(true)}
      onPointerUp={() => press(false)}
      onPointerLeave={() => press(false)}
      onPointerCancel={() => press(false)}
    >
      <div className="pl-bg pl-top" />
      <div className="pl-bg pl-bot" />
      <button type="button" className="pl-skip" onPointerDown={(e) => e.stopPropagation()} onClick={() => { skip.current = true }}>Skip</button>
      <div className="pl-in">
        <div className="pl-glow" />
        <div className="pl-mark">Ironline</div>
        <div className="pl-rig" ref={rig}>
          <svg viewBox="0 0 520 200" aria-hidden="true">
            <defs>
              <linearGradient id="plg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f6e4bd" />
                <stop offset=".5" stopColor="#d8b983" />
                <stop offset="1" stopColor="#8f6c3a" />
              </linearGradient>
              <linearGradient id="plb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9dbe0" />
                <stop offset="1" stopColor="#6d7076" />
              </linearGradient>
            </defs>
            <rect x="16" y="96" width="488" height="8" rx="4" fill="url(#plb)" />
            <rect x="16" y="90" width="10" height="20" rx="3" fill="url(#plb)" />
            <rect x="494" y="90" width="10" height="20" rx="3" fill="url(#plb)" />
            <rect x="170" y="87" width="6" height="26" rx="2" fill="url(#plb)" />
            <rect x="344" y="87" width="6" height="26" rx="2" fill="url(#plb)" />
            {PLATES.map((pl) => (
              <g key={pl.x}>
                <rect className={`pl-plate l${pct >= pl.t ? ' on' : ''}`} x={pl.x} y={100 - pl.h / 2} width={pl.w} height={pl.h} rx="4" fill="url(#plg)" />
                <rect className={`pl-plate r${pct >= pl.t ? ' on' : ''}`} x={520 - pl.x - pl.w} y={100 - pl.h / 2} width={pl.w} height={pl.h} rx="4" fill="url(#plg)" />
              </g>
            ))}
          </svg>
        </div>
        <div className="pl-count">{pct}<small>%</small></div>
        <div className="pl-line"><i /></div>
        <p className="pl-hint">{phase !== 'load' ? 'Let’s lift' : holding ? 'Lifting…' : 'Press and hold to lift faster'}</p>
      </div>
    </div>
  )
}
