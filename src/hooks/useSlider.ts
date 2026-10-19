import { useState, useCallback } from 'react'

interface UseSliderOptions {
  total: number
}

interface UseSliderReturn {
  current: number
  goTo: (index: number) => void
  goNext: () => void
  goPrev: () => void
}

export function useSlider({ total }: UseSliderOptions): UseSliderReturn {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      if (total > 0) setCurrent(((index % total) + total) % total)
    },
    [total],
  )
  const goNext = useCallback(() => {
    if (total > 0) setCurrent((c) => (c + 1) % total)
  }, [total])
  const goPrev = useCallback(() => {
    if (total > 0) setCurrent((c) => (c - 1 + total) % total)
  }, [total])

  return { current, goTo, goNext, goPrev }
}
