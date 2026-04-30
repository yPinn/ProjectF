import { type Env, ALL_USERNAMES, JSON_HEADERS, getAppToken } from './_shared'

interface TwitchUser {
  login: string
  display_name: string
  profile_image_url: string
  description: string
}

export interface TwitchProfile {
  profileImageUrl: string
  displayName: string
  description: string
}

export async function onRequest(ctx: {
  env: Env
  waitUntil: (p: Promise<unknown>) => void
}): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache: Cache = (caches as any).default
  const CACHE_KEY = 'https://twitch-cache.internal/users'

  const cached = await cache.match(CACHE_KEY)
  if (cached) {
    return new Response(await cached.text(), { headers: JSON_HEADERS })
  }

  try {
    const token = await getAppToken(ctx.env)

    const params = new URLSearchParams()
    ALL_USERNAMES.forEach((u) => params.append('login', u))

    const res = await fetch(`https://api.twitch.tv/helix/users?${params}`, {
      headers: {
        'Client-ID': ctx.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'twitch_api_error' }), {
        status: 502,
        headers: JSON_HEADERS,
      })
    }

    const { data: users } = (await res.json()) as { data: TwitchUser[] }

    const profileMap: Record<string, TwitchProfile> = {}
    users.forEach((u) => {
      profileMap[u.login] = {
        profileImageUrl: u.profile_image_url,
        displayName: u.display_name,
        description: u.description,
      }
    })

    const body = JSON.stringify(profileMap)

    // User profiles rarely change — cache for 24 hours
    ctx.waitUntil(
      cache.put(CACHE_KEY, new Response(body, { headers: { 'Cache-Control': 'max-age=86400' } })),
    )

    return new Response(body, { headers: { ...JSON_HEADERS, 'Cache-Control': 'max-age=86400' } })
  } catch {
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: JSON_HEADERS,
    })
  }
}
