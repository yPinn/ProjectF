import { useCallback, useEffect, useRef } from 'react'

export function useAudio() {
  const current = useRef<HTMLAudioElement | null>(null)
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    const audio = current.current
    if (!audio) return
    current.current = null
    if (fadeRef.current) clearInterval(fadeRef.current)
    fadeRef.current = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.08)
      } else {
        audio.pause()
        audio.currentTime = 0
        if (fadeRef.current) clearInterval(fadeRef.current)
        fadeRef.current = null
      }
    }, 20)
  }, [])

  const play = useCallback(
    (src: string, volume = 0.85) => {
      stop()
      const audio = new Audio(src)
      audio.volume = volume
      current.current = audio
      audio.play().catch(() => {})
    },
    [stop],
  )

  useEffect(() => {
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current)
      const audio = current.current
      if (audio) {
        audio.pause()
        current.current = null
      }
    }
  }, [])

  return { play, stop }
}
