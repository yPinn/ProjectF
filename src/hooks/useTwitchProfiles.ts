import { useState, useEffect } from 'react'
import people from '@/data/people.json'

// A changed roster must not reuse the browser's previous 24-hour profile response.
const rosterQuery = new URLSearchParams({
  v: people
    .map((person) => person.username)
    .sort()
    .join(','),
})

export interface TwitchProfile {
  profileImageUrl: string
  displayName: string
  description: string
}

export type TwitchProfileMap = Record<string, TwitchProfile>

export function useTwitchProfiles(enabled = true): TwitchProfileMap {
  const [profiles, setProfiles] = useState<TwitchProfileMap>({})

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    fetch(`/api/users?${rosterQuery}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TwitchProfileMap) => {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return
        const valid = Object.fromEntries(
          Object.entries(data).filter(
            ([, value]) =>
              value &&
              typeof value.displayName === 'string' &&
              typeof value.profileImageUrl === 'string' &&
              value.profileImageUrl.startsWith('https://'),
          ),
        )
        if (!controller.signal.aborted) setProfiles(valid)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [enabled])

  return profiles
}
