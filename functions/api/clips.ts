import { type Env, ALL_USERNAMES, JSON_HEADERS, getAppToken } from './_shared'

interface ClipContext {
  request: Request
  env: Env
  waitUntil: (promise: Promise<unknown>) => void
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } })
}

export async function onRequest({ request, env, waitUntil }: ClipContext): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { Allow: 'GET' })
  const username = new URL(request.url).searchParams.get('username')?.trim().toLowerCase() ?? ''
  if (!ALL_USERNAMES.includes(username)) return json({ error: 'invalid_username' }, 400)

  try {
    const cache = (caches as CacheStorage & { default: Cache }).default
    const cacheKey = `https://twitch-cache.internal/clips/${username}?v=1`
    const cached = await cache.match(cacheKey).catch(() => undefined)
    if (cached) return cached
    if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET)
      return json({ error: 'service_unavailable' }, 503)

    const token = await getAppToken(env)
    const headers = { 'Client-ID': env.TWITCH_CLIENT_ID, Authorization: `Bearer ${token}` }
    const userUrl = new URL('https://api.twitch.tv/helix/users')
    userUrl.searchParams.set('login', username)
    const userResponse = await fetch(userUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(8000),
    })
    if (!userResponse.ok) throw new Error('Twitch users unavailable')
    const users = (await userResponse.json()) as { data?: { id?: string }[] }
    const broadcasterId = users.data?.[0]?.id
    if (!broadcasterId) return json({ error: 'user_not_found' }, 404)
    if (!/^\d+$/.test(broadcasterId)) throw new Error('Invalid broadcaster ID')

    // Twitch orders broadcaster clips by view_count descending. Omitting dates
    // searches all available clips; first=1 returns the most-viewed clip.
    const clipsUrl = new URL('https://api.twitch.tv/helix/clips')
    clipsUrl.searchParams.set('broadcaster_id', broadcasterId)
    clipsUrl.searchParams.set('first', '1')
    const clipsResponse = await fetch(clipsUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(8000),
    })
    if (!clipsResponse.ok) throw new Error('Twitch clips unavailable')
    const result = (await clipsResponse.json()) as {
      data?: { id?: unknown; title?: unknown; view_count?: unknown }[]
    }
    if (!Array.isArray(result.data)) throw new Error('Invalid clip response')
    const top = result.data[0]
    let clip = null
    if (top) {
      if (
        typeof top.id !== 'string' ||
        !/^[A-Za-z0-9_-]{1,200}$/.test(top.id) ||
        typeof top.view_count !== 'number' ||
        !Number.isSafeInteger(top.view_count) ||
        top.view_count < 0
      )
        throw new Error('Invalid clip data')
      clip = {
        id: top.id,
        title: typeof top.title === 'string' ? top.title : '精華片段',
        viewCount: top.view_count,
        url: `https://clips.twitch.tv/${encodeURIComponent(top.id)}`,
      }
    }
    const response = json({ clip }, 200, {
      'Cache-Control': `public, max-age=300, s-maxage=${clip ? 3600 : 300}`,
    })
    waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}))
    return response
  } catch {
    return json({ error: 'twitch_api_error' }, 502)
  }
}
