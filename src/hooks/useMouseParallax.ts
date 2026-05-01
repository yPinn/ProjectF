import { type RefObject, useEffect } from 'react'

export function useMouseParallax(containerRef: RefObject<HTMLElement | null>, depth = 14) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const pos = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      pos.x = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * depth
      pos.y = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * depth
    }

    const onLeave = () => {
      pos.x = 0
      pos.y = 0
    }

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.08
      cur.y += (pos.y - cur.y) * 0.08
      el.style.setProperty('--px', `${cur.x.toFixed(2)}px`)
      el.style.setProperty('--py', `${cur.y.toFixed(2)}px`)
      raf = requestAnimationFrame(tick)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      el.style.removeProperty('--px')
      el.style.removeProperty('--py')
    }
  }, [containerRef, depth])
}
