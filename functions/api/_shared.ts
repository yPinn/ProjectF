export interface Env {
  TWITCH_CLIENT_ID: string
  TWITCH_CLIENT_SECRET: string
}

import peopleData from '../../src/data/people.json'

export const ALL_USERNAMES: string[] = peopleData.map((p) => p.username)

export const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

// Persists within a CF isolate's lifetime — avoids re-requesting tokens on every request
let tokenCache: { value: string; expiresAt: number } | null = null
// In-flight promise prevents concurrent requests from each triggering a new OAuth call
let tokenInflight: Promise<string> | null = null

async function fetchNewToken(env: Env): Promise<string> {
  const now = Date.now()
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  })
  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = { value: data.access_token, expiresAt: now + data.expires_in * 1000 }
  return data.access_token
}

export async function getAppToken(env: Env): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.value
  if (tokenInflight) return tokenInflight
  tokenInflight = fetchNewToken(env).finally(() => {
    tokenInflight = null
  })
  return tokenInflight
}
