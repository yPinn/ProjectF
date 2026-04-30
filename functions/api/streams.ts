import { type Env, ALL_USERNAMES, JSON_HEADERS, getAppToken } from './_shared'

interface TwitchStream {
  user_login: string
  game_name: string
  title: string
  viewer_count: number
}

interface StreamStatus {
  isLive: boolean
  viewerCount?: number
  title?: string
  gameName?: string
}

export async function onRequest(ctx: {
  env: Env
  waitUntil: (p: Promise<unknown>) => void
}): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache: Cache = (caches as any).default
  const CACHE_KEY = 'https://twitch-cache.internal/streams'

  const cached = await cache.match(CACHE_KEY)
  if (cached) {
    return new Response(await cached.text(), { headers: JSON_HEADERS })
  }

  try {
    const token = await getAppToken(ctx.env)

    const params = new URLSearchParams()
    ALL_USERNAMES.forEach((u) => params.append('user_login', u))

    const res = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
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

    const { data: streams } = (await res.json()) as { data: TwitchStream[] }

    const statusMap: Record<string, StreamStatus> = {}
    ALL_USERNAMES.forEach((u) => (statusMap[u] = { isLive: false }))
    streams.forEach((s) => {
      statusMap[s.user_login] = {
        isLive: true,
        viewerCount: s.viewer_count,
        title: s.title,
        gameName: s.game_name,
      }
    })

    const body = JSON.stringify(statusMap)

    ctx.waitUntil(
      cache.put(CACHE_KEY, new Response(body, { headers: { 'Cache-Control': 'max-age=60' } })),
    )

    return new Response(body, { headers: { ...JSON_HEADERS, 'Cache-Control': 'max-age=60' } })
  } catch {
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: JSON_HEADERS,
    })
  }
}
