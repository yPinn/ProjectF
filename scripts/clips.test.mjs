import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { onRequest } from '../.tools/clip-tests/clips.js'

const people = JSON.parse(readFileSync(new URL('../src/data/people.json', import.meta.url), 'utf8'))
const usernames = people.map((person) => person.username)
const testUsername = usernames[0]
let unlistedUsername = 'unlisted_member'
for (let index = 0; usernames.includes(unlistedUsername); index++) {
  unlistedUsername = `unlisted_${index}`
}
const originalFetch = globalThis.fetch
const originalCaches = globalThis.caches
const env = { TWITCH_CLIENT_ID: 'test-client', TWITCH_CLIENT_SECRET: 'test-secret' }
let cache
let calls
let pending
let clipData
let failUpstream

beforeEach(() => {
  cache = new Map()
  calls = []
  pending = []
  clipData = [{ id: 'MostViewedClip-123', title: 'Top clip', view_count: 54321 }]
  failUpstream = false
  globalThis.caches = {
    default: {
      match: async (key) => cache.get(String(key))?.clone(),
      put: async (key, response) => {
        cache.set(String(key), response.clone())
      },
    },
  }
  globalThis.fetch = async (input) => {
    const url = new URL(input)
    calls.push(url)
    if (failUpstream) return new Response('upstream failed', { status: 503 })
    if (url.hostname === 'id.twitch.tv')
      return Response.json({ access_token: 'test-token', expires_in: 3600 })
    if (url.pathname === '/helix/users')
      return Response.json({ data: [{ id: '12345', login: url.searchParams.get('login') }] })
    if (url.pathname === '/helix/clips') return Response.json({ data: clipData })
    throw new Error(`Unexpected outbound URL: ${url.origin}${url.pathname}`)
  }
})
afterEach(() => {
  globalThis.fetch = originalFetch
  globalThis.caches = originalCaches
})

function request(username = testUsername, options = {}) {
  return onRequest({
    request: new Request(
      `https://site.example/api/clips?username=${encodeURIComponent(username)}`,
      options,
    ),
    env,
    waitUntil: (promise) => pending.push(promise),
  })
}

test('rejects unknown members before contacting Twitch', async () => {
  const response = await request('https://attacker.example')
  assert.equal(response.status, 400)
  assert.equal(calls.length, 0)
})

test('uses every configured Twitch login and rejects unlisted logins', async () => {
  assert.ok(usernames.length > 0)
  for (const username of usernames) {
    assert.equal((await request(username)).status, 200, username)
    const userCall = calls.findLast((url) => url.pathname === '/helix/users')
    assert.equal(userCall.searchParams.get('login'), username)
  }
  const count = calls.length
  assert.equal((await request(unlistedUsername)).status, 400)
  assert.equal(calls.length, count)
})
test('only accepts GET', async () => {
  assert.equal((await request(testUsername, { method: 'POST' })).status, 405)
  assert.equal(calls.length, 0)
})
test('missing Twitch settings returns 503 without outbound requests', async () => {
  const response = await onRequest({
    request: new Request(`https://site.example/api/clips?username=${testUsername}`),
    env: {},
    waitUntil: (promise) => pending.push(promise),
  })
  assert.equal(response.status, 503)
  assert.equal(calls.length, 0)
})
test('requests the all-time top clip and exposes only public clip fields', async () => {
  const response = await request()
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.deepEqual(body, {
    clip: {
      id: 'MostViewedClip-123',
      title: 'Top clip',
      viewCount: 54321,
      url: 'https://clips.twitch.tv/MostViewedClip-123',
    },
  })
  const query = calls.find((url) => url.pathname === '/helix/clips')
  assert.equal(query.searchParams.get('broadcaster_id'), '12345')
  assert.equal(query.searchParams.get('first'), '1')
  assert.equal(query.searchParams.has('started_at'), false)
  assert.equal(query.searchParams.has('ended_at'), false)
  assert.equal(JSON.stringify(body).includes('test-token'), false)
  assert.equal(JSON.stringify(body).includes('test-secret'), false)
})
test('reuses cached clip results', async () => {
  await request()
  await Promise.all(pending)
  const firstCount = calls.length
  assert.equal((await request()).status, 200)
  assert.equal(calls.length, firstCount)
})
test('empty clip list returns an explicit null', async () => {
  clipData = []
  const response = await request()
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { clip: null })
})
test('upstream failures do not leak upstream content or credentials', async () => {
  failUpstream = true
  const response = await request()
  assert.equal(response.status, 502)
  assert.deepEqual(await response.json(), { error: 'twitch_api_error' })
})
test('rejects malformed clip IDs instead of constructing untrusted URLs', async () => {
  clipData = [{ id: 'bad?id=x&parent=attacker.example', title: 'bad', view_count: 1 }]
  assert.equal((await request()).status, 502)
})
