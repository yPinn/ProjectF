import { useState, useEffect } from 'react'
import type { StreamStatus } from '@/types'

export type StreamStatusMap = Record<string, StreamStatus>

export function useStreamStatus(): StreamStatusMap {
  const [statuses, setStatuses] = useState<StreamStatusMap>({})

  useEffect(() => {
    let cancelled = false

    async function fetch_() {
      try {
        const res = await fetch('/api/streams')
        if (res.ok && !cancelled) setStatuses(await res.json())
      } catch {
        // Network error — keep previous state, silent fail
      }
    }

    fetch_()
    const id = setInterval(fetch_, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return statuses
}
