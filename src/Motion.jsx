import { useEffect, useRef, useState } from 'react'

const calmMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Elements that fade and rise into view as the page scrolls. Tagged with a data attribute
// (not a class) so React re-renders never wipe the state.
const REVEAL = [
  '.sec-head > *', '.amen .wrap > div', '.ex-card', '.slot', '.plan.card', '.card',
  '.rem-card', '.row', '.pr-grid > *', '.goal-list > *', '.trainers > *', '.rem-head',
  '.tabs', '.stepper', 'footer .wrap > div',
].join(',')
const SKIP = '.hx, .site-nav, .tabbar, [role="dialog"], .toast'

export function useReveal() {
  useEffect(() => {
    if (calmMotion() || typeof IntersectionObserver === 'undefined') return undefined
    const seen = new WeakSet()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.setAttribute('data-rv', 'in')
        io.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })

    const scan = () => {
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (seen.has(el) || el.closest(SKIP) || el.parentElement?.closest('[data-rv]')) return
        seen.add(el)
        const index = Array.prototype.indexOf.call(el.parentElement.children, el)
        el.style.setProperty('--rv-i', String(Math.min(index, 7)))
        el.setAttribute('data-rv', '')
        io.observe(el)
      })
    }
    scan()
    let frame = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    })
    mo.observe(document.querySelector('.gym') || document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(frame) }
  }, [])
}

// Writes scroll progress (0 to 1) and a "scrolled" flag, used by the top progress line and the nav.
export function useScrollState(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      root.style.setProperty('--sp', max > 0 ? String(Math.min(1, y / max)) : '0')
      root.style.setProperty('--sy', String(Math.min(y, 900)))
      root.toggleAttribute('data-scrolled', y > 24)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [rootRef])
}

// A soft gold light that follows the pointer across cards.
const GLOW = '.amen .wrap > div, .ex-card, .slot, .card, .rem-card, .hx-head, .hx-stats, .hx-vid'
export function usePointerGlow() {
  useEffect(() => {
    if (calmMotion() || !window.matchMedia?.('(hover: hover)').matches) return undefined
    let frame = 0
    const onMove = (event) => {
      const el = event.target.closest?.(GLOW)
      if (!el) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${event.clientX - box.left}px`)
        el.style.setProperty('--my', `${event.clientY - box.top}px`)
      })
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => { document.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame) }
  }, [])
}

// Counts up to a number the first time it scrolls into view.
export function CountUp({ to, ms = 1400 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(() => (calmMotion() ? to : 0))
  useEffect(() => {
    if (calmMotion() || typeof IntersectionObserver === 'undefined') { setValue(to); return undefined }
    let frame = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min(1, (now - start) / ms)
        setValue(Math.round(to * (1 - (1 - t) ** 4)))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(frame) }
  }, [to, ms])
  return <span ref={ref}>{value}</span>
}

// Endless strip of lift names between the hero and the first section.
export function Marquee({ items }) {
  const row = items.map((item) => <span key={item}>{item}</span>)
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <div>{row}</div>
        <div>{row}</div>
      </div>
    </div>
  )
}
