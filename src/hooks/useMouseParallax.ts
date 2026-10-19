import { type RefObject, useEffect } from 'react'

export function useMouseParallax(containerRef: RefObject<HTMLElement | null>, depth = 14) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const media = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)')
    let visible = false
    let raf = 0
    const pos = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    const tick = () => {
      raf = 0
      if (!visible || document.hidden || !media.matches) return
      cur.x += (pos.x - cur.x) * 0.12
      cur.y += (pos.y - cur.y) * 0.12
      el.style.setProperty('--px', `${cur.x.toFixed(2)}px`)
      el.style.setProperty('--py', `${cur.y.toFixed(2)}px`)
      if (Math.abs(pos.x - cur.x) + Math.abs(pos.y - cur.y) > 0.05)
        raf = requestAnimationFrame(tick)
    }
    const schedule = () => {
      if (!raf && visible && !document.hidden && media.matches) raf = requestAnimationFrame(tick)
    }
    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      pos.x = ((event.clientX - rect.left) / rect.width - 0.5) * depth * 2
      pos.y = ((event.clientY - rect.top) / rect.height - 0.5) * depth * 2
      schedule()
    }
    const reset = () => {
      pos.x = 0
      pos.y = 0
      schedule()
    }
    const onAvailability = () => {
      if (document.hidden || !media.matches) {
        cancelAnimationFrame(raf)
        raf = 0
        cur.x = cur.y = pos.x = pos.y = 0
        el.style.removeProperty('--px')
        el.style.removeProperty('--py')
      } else schedule()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) {
        cancelAnimationFrame(raf)
        raf = 0
      } else schedule()
    })
    observer.observe(el)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', reset)
    document.addEventListener('visibilitychange', onAvailability)
    media.addEventListener('change', onAvailability)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', reset)
      document.removeEventListener('visibilitychange', onAvailability)
      media.removeEventListener('change', onAvailability)
      el.style.removeProperty('--px')
      el.style.removeProperty('--py')
    }
  }, [containerRef, depth])
}
