import { type KeyboardEvent, type TouchEvent, useRef } from 'react'

/** Attach to a carousel only: vertical gestures and page keys remain native. */
export function useCarouselInput(goNext: () => void, goPrev: () => void) {
  const touch = useRef<{ x: number; y: number } | null>(null)
  return {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (
        (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')
      )
        return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        if (event.key === 'ArrowRight') goNext()
        else goPrev()
      }
    },
    onTouchStart: (event: TouchEvent<HTMLElement>) => {
      touch.current =
        event.touches.length === 1
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : null
    },
    onTouchCancel: () => {
      touch.current = null
    },
    onTouchEnd: (event: TouchEvent<HTMLElement>) => {
      const start = touch.current
      touch.current = null
      if (!start || !event.changedTouches.length) return
      const dx = start.x - event.changedTouches[0].clientX
      const dy = start.y - event.changedTouches[0].clientY
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx > 0) goNext()
        else goPrev()
      }
    },
  }
}
