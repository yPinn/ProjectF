import { useEffect, useRef, useState } from 'react'
import type { TwitchClip } from '@/types'
import styles from './TwitchClipPlayer.module.css'

type Result = { status: 'loading' | 'error' } | { status: 'ready'; clip: TwitchClip | null }

export default function TwitchClipPlayer({ username, name }: { username: string; name: string }) {
  const [result, setResult] = useState<Result>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [active, setActive] = useState(() => !document.hidden)
  const [wideEnough, setWideEnough] = useState(() => window.innerWidth >= 454)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    const timeout = setTimeout(() => controller.abort(), 20000)
    fetch(`/api/clips?username=${encodeURIComponent(username)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Clip request failed')
        return response.json()
      })
      .then((data: { clip?: TwitchClip | null }) => {
        if (
          data.clip !== null &&
          (!data.clip ||
            typeof data.clip.id !== 'string' ||
            !/^[A-Za-z0-9_-]{1,200}$/.test(data.clip.id) ||
            typeof data.clip.title !== 'string' ||
            !Number.isSafeInteger(data.clip.viewCount))
        )
          throw new Error('Invalid clip response')
        if (alive) setResult({ status: 'ready', clip: data.clip })
      })
      .catch(() => {
        if (alive) setResult({ status: 'error' })
      })
      .finally(() => clearTimeout(timeout))
    return () => {
      alive = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [username, attempt])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    let inView = true
    const update = () => setActive(inView && !document.hidden)
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    const resize = new ResizeObserver(([entry]) => setWideEnough(entry.contentRect.width >= 402))
    intersection.observe(element)
    resize.observe(element)
    document.addEventListener('visibilitychange', update)
    return () => {
      intersection.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const clip = result.status === 'ready' ? result.clip : null
  const src = clip
    ? `https://clips.twitch.tv/embed?${new URLSearchParams({ clip: clip.id, parent: window.location.hostname, autoplay: 'true', muted: 'true' })}`
    : undefined

  return (
    <div ref={ref} className={styles.panel}>
      {result.status === 'loading' ? (
        <div className={styles.state} role="status">
          正在載入最高觀看精華…
        </div>
      ) : result.status === 'error' ? (
        <div className={styles.state} role="alert">
          <p>暫時無法載入精華片段。</p>
          <button
            type="button"
            onClick={() => {
              setResult({ status: 'loading' })
              setAttempt((value) => value + 1)
            }}
          >
            重新載入
          </button>
        </div>
      ) : !clip ? (
        <div className={styles.state} role="status">
          這位實況主目前沒有可播放的精華片段。
        </div>
      ) : !wideEnough ? (
        <div className={styles.state}>
          <p>{clip.title}</p>
          <a
            href={`https://clips.twitch.tv/${encodeURIComponent(clip.id)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            在 Twitch 播放精華
          </a>
        </div>
      ) : (
        <div className={styles.player}>
          {active && (
            <iframe
              src={src}
              title={`${name} 最高觀看精華：${clip.title}`}
              width="100%"
              height="100%"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </div>
      )}
    </div>
  )
}
