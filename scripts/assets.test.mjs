import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { generateAssets } from './lib/assets.mjs'

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'fuckent-assets-'))
  t.after(async () => {
    assert.equal(path.dirname(root), path.resolve(tmpdir()))
    assert.match(path.basename(root), /^fuckent-assets-/)
    await rm(root, { recursive: true, force: true })
  })
  for (const dir of ['src/data', 'public/images/members', 'public/images/games', 'public/audio'])
    await mkdir(path.join(root, dir), { recursive: true })
  const png = async (color) =>
    sharp({ create: { width: 12, height: 16, channels: 4, background: color } })
      .png()
      .toBuffer()
  const original = await png('#ee1144')
  await writeFile(path.join(root, 'public/images/members/test_user.png'), original)
  await writeFile(path.join(root, 'public/images/logo.png'), original)
  await writeFile(path.join(root, 'public/images/games/valorant.png'), original)
  const people = [
    {
      username: 'test_user',
      photo: '/images/members/test_user.png',
      color: '#ee1144',
      title: '測試成員',
      bio: '測試介紹',
      tags: ['Valorant'],
      section: 'slider',
      audio: '/audio/optional.mp3',
    },
  ]
  const save = async () =>
    writeFile(path.join(root, 'src/data/people.json'), JSON.stringify(people))
  await save()
  await writeFile(
    path.join(root, 'src/data/links.json'),
    JSON.stringify({ discord: { test_user: '' } }),
  )
  const warnings = []
  return {
    root,
    people,
    save,
    png,
    original,
    run: () => generateAssets({ root, warn: (m) => warnings.push(m) }),
    warnings,
  }
}

test('build produces deterministic, hashed assets without changing original images', async (t) => {
  const f = await fixture(t)
  const first = await f.run()
  const second = await f.run()
  assert.deepEqual(first, second)
  assert.match(first.members.test_user.photo, /test_user-portrait\.[a-f0-9]{16}\.webp$/)
  assert.match(first.logo, /logo\.[a-f0-9]{16}\.webp$/)
  assert.match(first.games.valorant, /game-valorant\.[a-f0-9]{16}\.webp$/)
  const bytes = await readFile(path.join(f.root, 'public', first.members.test_user.photo))
  assert.equal((await sharp(bytes).metadata()).format, 'webp')
  assert.deepEqual(
    await readFile(path.join(f.root, 'public/images/members/test_user.png')),
    f.original,
  )
  assert.equal(first.members.test_user.audio, null)
  assert.equal(first.members.test_user.missingPhoto, false)
  assert.match(f.warnings.join(' '), /optional.mp3/)
})

test('replacing a photo under the same filename updates every variant URL and removes stale outputs', async (t) => {
  const f = await fixture(t)
  const first = await f.run()
  await writeFile(path.join(f.root, 'public/images/members/test_user.png'), await f.png('#1166ee'))
  const second = await f.run()
  for (const field of ['photo', 'preview', 'thumbnail']) {
    assert.notEqual(first.members.test_user[field], second.members.test_user[field])
    assert.ok(existsSync(path.join(f.root, 'public', second.members.test_user[field])))
    assert.ok(!existsSync(path.join(f.root, 'public', first.members.test_user[field])))
  }
  assert.notEqual(first.members.test_user.sourceHash, second.members.test_user.sourceHash)
})

test('logo, game icons, audio availability and a renamed username update from source settings', async (t) => {
  const f = await fixture(t)
  const first = await f.run()
  await writeFile(path.join(f.root, 'public/images/logo.png'), await f.png('#22ff33'))
  await writeFile(path.join(f.root, 'public/images/games/valorant.png'), await f.png('#22ff33'))
  await writeFile(path.join(f.root, 'public/audio/optional.mp3'), Buffer.from('audio fixture'))
  f.people[0].username = 'lulumin1228'
  await f.save()
  await writeFile(
    path.join(f.root, 'src/data/links.json'),
    JSON.stringify({ discord: { lulumin1228: '' } }),
  )
  const second = await f.run()
  assert.notEqual(first.logo, second.logo)
  assert.notEqual(first.games.valorant, second.games.valorant)
  assert.deepEqual(Object.keys(second.members), ['lulumin1228'])
  assert.equal(second.members.lulumin1228.audio, '/audio/optional.mp3')
})

test('an explicitly omitted photo uses the generated fallback', async (t) => {
  const f = await fixture(t)
  f.people[0].photo = null
  await f.save()
  const assets = await f.run()
  assert.equal(assets.members.test_user.missingPhoto, true)
  assert.match(assets.members.test_user.photo, /fallback-portrait\./)
})

test('dictionary-like login and game names remain ordinary manifest entries', async (t) => {
  const f = await fixture(t)
  f.people[0].username = '__proto__'
  await f.save()
  await writeFile(
    path.join(f.root, 'src/data/links.json'),
    JSON.stringify({ discord: { ['__proto__']: '' } }),
  )
  await writeFile(path.join(f.root, 'public/images/games/__proto__.png'), f.original)
  const assets = await f.run()
  const serialized = JSON.parse(await readFile(path.join(f.root, 'src/data/assets.json'), 'utf8'))
  assert.ok(Object.hasOwn(assets.members, '__proto__'))
  assert.ok(Object.hasOwn(serialized.members, '__proto__'))
  assert.match(serialized.games.__proto__, /game-__proto__\./)
})

test('invalid or truncated images fail with source context and preserve the last valid manifest', async (t) => {
  const f = await fixture(t)
  await f.run()
  const manifest = await readFile(path.join(f.root, 'src/data/assets.json'))
  const outputs = await readdir(path.join(f.root, 'public/images/optimized'))
  for (const bad of [Buffer.from('\r\n'), f.original.subarray(0, 45)]) {
    await writeFile(path.join(f.root, 'public/images/members/test_user.png'), bad)
    await assert.rejects(f.run, /test_user.*test_user.png.*(decode|image)/i)
    assert.deepEqual(await readFile(path.join(f.root, 'src/data/assets.json')), manifest)
    assert.deepEqual(await readdir(path.join(f.root, 'public/images/optimized')), outputs)
  }
})

test('missing, external and escaping photo paths fail instead of silently keeping old images', async (t) => {
  const f = await fixture(t)
  for (const photo of [
    '/images/members/missing.png',
    '/images/../outside.png',
    'https://example.com/a.png',
    '/images/members/../../../secret.png',
    '/images/members/a\\b.png',
  ]) {
    f.people[0].photo = photo
    await f.save()
    await assert.rejects(f.run, /photo|path|missing/i)
  }
})

test('duplicate or invalid usernames and malformed member fields fail before generating', async (t) => {
  const f = await fixture(t)
  f.people.push({ ...f.people[0] })
  await f.save()
  await assert.rejects(f.run, /duplicate.*test_user/i)
  f.people.pop()
  for (const [field, bad] of [
    ['username', '../bad'],
    ['color', 'red'],
    ['tags', 'Valorant'],
    ['bio', null],
    ['photo', 42],
    ['audio', '/audio/../secret'],
  ]) {
    const original = f.people[0][field]
    f.people[0][field] = bad
    await f.save()
    await assert.rejects(f.run, new RegExp(field, 'i'))
    f.people[0][field] = original
  }
})

test('stale contact keys, unsafe contact URLs and malformed JSON fail clearly', async (t) => {
  const f = await fixture(t)
  for (const discord of [{ old_name: '' }, { test_user: 'javascript:alert(1)' }]) {
    await writeFile(path.join(f.root, 'src/data/links.json'), JSON.stringify({ discord }))
    await assert.rejects(f.run, /links|discord|contact/i)
  }
  await writeFile(path.join(f.root, 'src/data/people.json'), '{bad')
  await assert.rejects(f.run, /people.json/i)
})
