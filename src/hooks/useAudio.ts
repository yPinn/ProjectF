import { useRef } from 'react'

export function useAudio() {
  const current = useRef<HTMLAudioElement | null>(null)

  function play(src: string, volume = 0.85) {
    stop()
    const audio = new Audio(src)
    audio.volume = volume
    current.current = audio
    audio.play().catch(() => {})
  }

  function stop() {
    const audio = current.current
    if (!audio) return
    current.current = null
    const fade = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.08)
      } else {
        audio.pause()
        audio.currentTime = 0
        clearInterval(fade)
      }
    }, 20)
  }

  return { play, stop }
}
