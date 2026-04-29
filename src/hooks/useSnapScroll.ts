import { useEffect } from 'react'

const SECTION_IDS = ['splash', 'aboutSection', 'mainContent']
const THRESHOLD = 80
const COOLDOWN = 900

export function useSnapScroll(isModalOpen: boolean) {
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )

    if (sections.length < 2) return

    let isScrolling = false
    let accDelta = 0

    function currentIdx() {
      const mid = window.scrollY + window.innerHeight * 0.3
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= mid) return i
      }
      return 0
    }

    function goTo(idx: number) {
      if (idx < 0 || idx >= sections.length || isScrolling) return
      isScrolling = true
      sections[idx].scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => {
        isScrolling = false
        accDelta = 0
      }, COOLDOWN)
    }

    function onWheel(e: WheelEvent) {
      if (isModalOpen) return
      accDelta += e.deltaY
      if (Math.abs(accDelta) < THRESHOLD) return
      const dir = accDelta > 0 ? 1 : -1
      accDelta = 0
      if (dir < 0) return
      const cur = currentIdx()
      if (cur < sections.length - 1) goTo(cur + 1)
    }

    function onKeydown(e: KeyboardEvent) {
      if (isModalOpen) return
      if (e.key !== 'ArrowDown' && e.key !== 'PageDown') return
      const cur = currentIdx()
      if (cur >= sections.length - 1) return
      e.preventDefault()
      goTo(cur + 1)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    document.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('wheel', onWheel)
      document.removeEventListener('keydown', onKeydown)
    }
  }, [isModalOpen])
}
