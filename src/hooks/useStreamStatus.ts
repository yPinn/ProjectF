import { useState, useEffect } from 'react'
import type { StreamStatus } from '@/types'

export type StreamStatusMap = Record<string, StreamStatus>

export interface StreamStatusResult {
  statuses: StreamStatusMap
  /** true until the first fetch completes (success or failure) */
  loading: boolean
}

export function useStreamStatus(): StreamStatusResult {
  const [statuses, setStatuses] = useState<StreamStatusMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetch_() {
      try {
        const res = await fetch('/api/streams')
        if (res.ok && !cancelled) setStatuses(await res.json())
      } catch {
        // Network error — keep previous state, silent fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch_()
    const id = setInterval(fetch_, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { statuses, loading }
}
