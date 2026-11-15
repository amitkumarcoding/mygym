import { useEffect, useRef } from 'react'

// Fixed, full-page ambient layer: gold dust, rising embers and a few faint gym silhouettes
// that drift with a parallax effect. Pauses when the tab is hidden and respects reduced motion.
const GOLD = '216,185,131'
const HI = '246,228,189'

function drawIcon(ctx, kind, size) {
  ctx.beginPath()
  if (kind === 0) { // dumbbell
    const w = size, h = size * 0.62, bar = size * 0.14
    ctx.rect(-w * 0.5, -h * 0.5, w * 0.16, h)
    ctx.rect(-w * 0.34, -h * 0.34, w * 0.1, h * 0.68)
    ctx.rect(w * 0.34 - w * 0.1 + w * 0.1, -h * 0.34, w * 0.1, h * 0.68)
    ctx.rect(w * 0.34, -h * 0.5, w * 0.16, h)
    ctx.rect(-w * 0.24, -bar / 2, w * 0.48, bar)
  } else if (kind === 1) { // weight plate
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2)
    ctx.moveTo(size * 0.34, 0); ctx.arc(0, 0, size * 0.34, 0, Math.PI * 2)
    ctx.moveTo(size * 0.09, 0); ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2)
  } else { // kettlebell
    ctx.arc(0, size * 0.12, size * 0.34, 0, Math.PI * 2)
    ctx.moveTo(-size * 0.2, -size * 0.14)
    ctx.bezierCurveTo(-size * 0.2, -size * 0.52, size * 0.2, -size * 0.52, size * 0.2, -size * 0.14)
    ctx.moveTo(-size * 0.12, size * 0.5); ctx.lineTo(size * 0.12, size * 0.5)
  }
  ctx.stroke()
}

export default function Ambient() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    if (window.matchMedia?.('(max-width: 980px), (pointer: coarse)').matches) return undefined
    const ctx = canvas.getContext('2d')
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia?.('(max-width: 700px)').matches
    let w = 0, h = 0, dpr = 1, raf = 0, running = true
    const mouse = { x: -999, y: -999 }
    let scrollY = window.scrollY
    let list = []

    const rnd = (a, b) => a + Math.random() * (b - a)
    const make = () => {
      const dust = small ? 34 : 78, ember = small ? 8 : 20, icons = small ? 3 : 7
      list = []
      for (let i = 0; i < dust; i++) list.push({ t: 'dust', x: rnd(0, w), y: rnd(0, h), r: rnd(0.6, 1.9), vx: rnd(-0.08, 0.08), vy: rnd(-0.16, -0.03), d: rnd(0.15, 0.9), a: rnd(0.15, 0.55), ph: rnd(0, 6.28) })
      for (let i = 0; i < ember; i++) list.push({ t: 'ember', x: rnd(0, w), y: rnd(0, h), r: rnd(0.8, 1.6), vx: rnd(-0.12, 0.12), vy: rnd(-0.6, -0.25), d: rnd(0.4, 1), a: rnd(0.35, 0.8), ph: rnd(0, 6.28) })
      for (let i = 0; i < icons; i++) list.push({ t: 'icon', k: i % 3, x: rnd(0, w), y: rnd(0, h), s: rnd(46, 92), rot: rnd(0, 6.28), vr: rnd(-0.0018, 0.0018), vx: rnd(-0.05, 0.05), vy: rnd(-0.08, -0.02), d: rnd(0.25, 0.7), a: rnd(0.07, 0.15) })
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      make()
    }

    const frame = (time) => {
      ctx.clearRect(0, 0, w, h)
      const par = scrollY
      for (const p of list) {
        p.x += p.vx; p.y += p.vy
        if (p.t === 'icon') p.rot += p.vr
        const pad = p.t === 'icon' ? 120 : 10
        if (p.y < -pad) { p.y = h + pad; p.x = rnd(0, w) }
        if (p.x < -pad) p.x = w + pad
        if (p.x > w + pad) p.x = -pad
        // parallax: deeper layers move more as the page scrolls
        let y = (p.y - par * p.d * 0.35) % (h + pad * 2)
        if (y < -pad) y += h + pad * 2
        let x = p.x
        const dx = x - mouse.x, dy = y - mouse.y, dist2 = dx * dx + dy * dy
        if (dist2 < 14000) { const f = (1 - dist2 / 14000) * 14; const m = Math.sqrt(dist2) || 1; x += (dx / m) * f; y += (dy / m) * f }

        if (p.t === 'icon') {
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot)
          ctx.strokeStyle = `rgba(${GOLD},${p.a})`; ctx.lineWidth = 1.1
          drawIcon(ctx, p.k, p.s); ctx.restore()
        } else {
          const tw = 0.6 + 0.4 * Math.sin(time * 0.0015 + p.ph)
          const a = p.a * tw
          if (p.t === 'ember') {
            const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * 6)
            g.addColorStop(0, `rgba(${HI},${a})`); g.addColorStop(1, `rgba(${GOLD},0)`)
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r * 6, 0, 6.283); ctx.fill()
          }
          ctx.fillStyle = `rgba(${p.t === 'ember' ? HI : GOLD},${Math.min(1, a + 0.1)})`
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.283); ctx.fill()
        }
      }
      if (running && !calm) raf = requestAnimationFrame(frame)
    }

    const onScroll = () => { scrollY = window.scrollY }
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    const onLeave = () => { mouse.x = mouse.y = -999 }
    const onVis = () => {
      running = !document.hidden
      cancelAnimationFrame(raf)
      if (running && !calm) raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="ambient" aria-hidden="true" />
}
