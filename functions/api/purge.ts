import { type Env, ALL_USERNAMES, JSON_HEADERS } from './_shared'

export async function onRequest(ctx: { request: Request; env: Env }): Promise<Response> {
  if (ctx.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    })
  }

  const auth = ctx.request.headers.get('Authorization')
  if (!ctx.env.PURGE_SECRET || auth !== `Bearer ${ctx.env.PURGE_SECRET}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache: Cache = (caches as any).default

  const streamsKey = 'https://twitch-cache.internal/streams'
  const usersHash = ALL_USERNAMES.slice().sort().join(',')
  const usersKey = `https://twitch-cache.internal/users?v=${encodeURIComponent(usersHash)}`

  const [streams, users] = await Promise.all([cache.delete(streamsKey), cache.delete(usersKey)])

  return new Response(JSON.stringify({ ok: true, purged: { streams, users } }), {
    headers: JSON_HEADERS,
  })
}
