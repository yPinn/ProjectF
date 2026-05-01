import { useEffect } from 'react'

const SECTION_IDS = ['splash', 'aboutSection', 'streamerSlider', 'mainContent']
const THRESHOLD = 50
const DURATION = 500

/** ease-in-out cubic */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Animates window.scrollY to targetY. Returns a cancel function.
 * onDone() is called only on natural completion, not on cancel.
 */
function animateScrollTo(targetY: number, duration: number, onDone: () => void): () => void {
  const startY = window.scrollY
  const dist = targetY - startY
  if (Math.abs(dist) < 1) {
    onDone()
    return () => {}
  }

  const startTime = performance.now()
  let rafId: number

  function tick(now: number) {
    const t = Math.min((now - startTime) / duration, 1)
    window.scrollTo(0, startY + dist * easeInOutCubic(t))
    if (t < 1) rafId = requestAnimationFrame(tick)
    else onDone()
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

export function useSnapScroll(isModalOpen: boolean) {
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )

    if (sections.length < 2) return

    let offsets = sections.map((el) => el.offsetTop)
    const onResize = () => {
      offsets = sections.map((el) => el.offsetTop)
    }
    window.addEventListener('resize', onResize, { passive: true })

    let accDelta = 0
    let cancelScroll: (() => void) | null = null
    // Track intended destination so mid-animation input chains from there, not mid-scroll position
    let destIdx: number | null = null

    function currentIdx() {
      const mid = window.scrollY + window.innerHeight * 0.3
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (offsets[i] <= mid) return i
      }
      return 0
    }

    function goTo(idx: number) {
      if (idx < 0 || idx >= sections.length) return
      destIdx = idx
      accDelta = 0
      cancelScroll?.()
      cancelScroll = animateScrollTo(offsets[idx], DURATION, () => {
        destIdx = null
        cancelScroll = null
      })
    }

    function onWheel(e: WheelEvent) {
      if (isModalOpen) return
      accDelta += e.deltaY
      if (Math.abs(accDelta) < THRESHOLD) return
      const dir = accDelta > 0 ? 1 : -1
      accDelta = 0
      if (dir < 0) return // up-scroll is intentionally free-scrolling; only snap forward

      // During animation use destIdx so chained scrolls step from the destination, not mid-flight position
      const cur = destIdx ?? currentIdx()
      if (sections[cur]?.id === 'streamerSlider') return
      if (cur < sections.length - 1) goTo(cur + 1)
    }

    function onKeydown(e: KeyboardEvent) {
      if (isModalOpen) return
      if (e.key !== 'ArrowDown' && e.key !== 'PageDown') return
      const cur = destIdx ?? currentIdx()
      if (sections[cur]?.id === 'streamerSlider') return
      if (cur >= sections.length - 1) return
      e.preventDefault()
      goTo(cur + 1)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    document.addEventListener('keydown', onKeydown)
    return () => {
      cancelScroll?.()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('keydown', onKeydown)
    }
  }, [isModalOpen])
}
