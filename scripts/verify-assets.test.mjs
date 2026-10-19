import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const readJson = (name) => JSON.parse(readFileSync(path.join(root, 'src/data', name), 'utf8'))
const people = readJson('people.json')
const assets = readJson('assets.json')
const local = (url) => path.join(root, 'public', url.replace(/^\//, ''))

test('every roster member has working portrait, preview, thumbnail and optional audio', () => {
  assert.deepEqual(Object.keys(assets).sort(), people.map((person) => person.username).sort())
  for (const person of people) {
    const asset = assets[person.username]
    for (const key of ['photo', 'preview', 'thumbnail']) {
      assert.ok(existsSync(local(asset[key])), `${person.username}: missing ${key}`)
    }
    assert.ok(asset.width > 0 && asset.height > 0)
    assert.equal(asset.missingPhoto, !existsSync(local(person.photo)))
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
  assert.ok(statSync(local('/images/optimized/logo.webp')).size < 80 * 1024)
})
