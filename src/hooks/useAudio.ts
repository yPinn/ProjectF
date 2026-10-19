import { useCallback, useEffect, useRef } from 'react'

export function useAudio() {
  const current = useRef<HTMLAudioElement | null>(null)
  const stop = useCallback(() => {
    const audio = current.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    current.current = null
  }, [])
  const play = useCallback(
    (src: string, volume = 0.85) => {
      stop()
      const audio = new Audio(src)
      audio.volume = volume
      current.current = audio
      audio.play().catch(() => {
        if (current.current === audio) stop()
      })
    },
    [stop],
  )
  useEffect(() => stop, [stop])
  return { play, stop }
}
