import { useState, useEffect, useCallback } from 'react'

interface UseSliderOptions {
  total: number
  /** 自動播放間隔（ms），0 = 停用 */
  autoPlayMs?: number
}

interface UseSliderReturn {
  current: number
  goTo: (index: number) => void
  goNext: () => void
  goPrev: () => void
}

export function useSlider({ total, autoPlayMs = 0 }: UseSliderOptions): UseSliderReturn {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total)
    },
    [total],
  )

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  // 鍵盤切換
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // 觸控滑動切換
  useEffect(() => {
    let startX = 0
    const onTouchStart = (e: TouchEvent) => {
      startX = e.changedTouches[0].clientX
    }
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext()
        else goPrev()
      }
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [goNext, goPrev])

  // 自動播放
  useEffect(() => {
    if (!autoPlayMs) return
    const timer = setInterval(goNext, autoPlayMs)
    return () => clearInterval(timer)
  }, [autoPlayMs, goNext])

  return { current, goTo, goNext, goPrev }
}
