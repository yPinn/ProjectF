import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const readJson = (name) => JSON.parse(readFileSync(path.join(root, 'src/data', name), 'utf8'))
const people = readJson('people.json')
const manifest = readJson('assets.json')
const assets = manifest.members
const local = (url) => path.join(root, 'public', url.replace(/^\//, ''))

test('every roster member has decodable current portraits, previews, thumbnails and optional audio', async () => {
  assert.deepEqual(Object.keys(assets).sort(), people.map((person) => person.username).sort())
  for (const person of people) {
    const asset = assets[person.username]
    for (const key of ['photo', 'preview', 'thumbnail']) {
      assert.ok(existsSync(local(asset[key])), `${person.username}: missing ${key}`)
      assert.equal((await sharp(local(asset[key])).metadata()).format, 'webp')
    }
    assert.ok(asset.width > 0 && asset.height > 0)
    assert.equal(asset.missingPhoto, person.photo == null)
    const source = readFileSync(local(person.photo ?? '/images/logo.png'))
    assert.equal(
      asset.sourceHash,
      createHash('sha256').update(source).digest('hex'),
      person.username,
    )
    assert.equal(Boolean(asset.audio), Boolean(person.audio && existsSync(local(person.audio))))
    if (asset.audio) assert.ok(existsSync(local(asset.audio)))
  }
})

test('all portrait variants and the UI font stay inside loading budgets', () => {
  const files = new Set(
    Object.values(assets).flatMap((asset) => [asset.photo, asset.preview, asset.thumbnail]),
  )
  const total = [...files].reduce((sum, url) => sum + statSync(local(url)).size, 0)
  assert.ok(total < 2 * 1024 * 1024, `Portrait variants exceed 2 MiB: ${total}`)
  assert.ok(statSync(local('/fonts/jf-openhuninn-ui.woff2')).size < 200 * 1024)
  assert.ok(statSync(local(manifest.logo)).size < 80 * 1024)
})

test('account rename reaches generated media and contact settings', () => {
  const ids = people.map((p) => p.username)
  assert.ok(ids.includes('lulumin1228'))
  assert.ok(!ids.includes('luming1228'))
  assert.ok(Object.hasOwn(readJson('links.json').discord, 'lulumin1228'))
})
