import { useState, useEffect } from 'react'

export interface TwitchProfile {
  profileImageUrl: string
  displayName: string
  description: string
}

export type TwitchProfileMap = Record<string, TwitchProfile>

export function useTwitchProfiles(): TwitchProfileMap {
  const [profiles, setProfiles] = useState<TwitchProfileMap>({})

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/users', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TwitchProfileMap) => setProfiles(data))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return profiles
}
