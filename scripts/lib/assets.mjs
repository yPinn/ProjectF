import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, readdir, realpath, lstat, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

async function readJson(filename) {
  try {
    return JSON.parse(await readFile(filename, 'utf8'))
  } catch (error) {
    throw new Error(`${path.basename(filename)}: cannot read valid JSON (${error.message})`, {
      cause: error,
    })
  }
}

function validateSettings(people, links) {
  if (!Array.isArray(people) || people.length === 0)
    throw new Error('people.json: expected a non-empty member array')
  const usernames = new Set()
  for (const person of people) {
    if (
      !isObject(person) ||
      typeof person.username !== 'string' ||
      !/^[a-z0-9_]{1,25}$/.test(person.username)
    )
      throw new Error('people.json: username must be a lowercase Twitch login (letters, digits, _)')
    if (usernames.has(person.username)) throw new Error(`Duplicate username: ${person.username}`)
    usernames.add(person.username)
    const label = `people.json: ${person.username}`
    if (typeof person.color !== 'string' || !/^#[a-f0-9]{6}$/i.test(person.color))
      throw new Error(`${label}: color must be a six-digit hex value`)
    for (const field of ['title', 'bio'])
      if (typeof person[field] !== 'string') throw new Error(`${label}: ${field} must be a string`)
    if (person.section !== 'slider') throw new Error(`${label}: section must be slider`)
    if (!Array.isArray(person.tags) || !person.tags.every((tag) => typeof tag === 'string'))
      throw new Error(`${label}: tags must be a string array`)
    for (const field of ['photo', 'audio'])
      if (person[field] != null && typeof person[field] !== 'string')
        throw new Error(`${label}: ${field} must be a local path or null`)
  }
  if (!isObject(links) || !isObject(links.discord))
    throw new Error('links.json: discord must be an object keyed by username')
  for (const [username, url] of Object.entries(links.discord)) {
    if (!usernames.has(username))
      throw new Error(`links.json: unknown contact username ${username}`)
    if (url === '') continue
    try {
      const parsed = new URL(url)
      if (
        typeof url !== 'string' ||
        parsed.protocol !== 'https:' ||
        parsed.username ||
        parsed.password
      )
        throw new Error('invalid URL')
    } catch {
      throw new Error(`links.json: contact for ${username} must be an HTTPS URL or empty string`)
    }
  }
}

function localPath(publicDir, url, prefix, label) {
  if (
    typeof url !== 'string' ||
    !url.startsWith(prefix) ||
    url.length <= prefix.length ||
    /[\\\0?#%]/.test(url) ||
    url.split('/').some((segment) => segment === '.' || segment === '..')
  )
    throw new Error(`${label}: invalid local path ${String(url)} (expected ${prefix}...)`)
  const filename = path.resolve(publicDir, `.${url}`)
  const relative = path.relative(publicDir, filename)
  if (relative.startsWith('..') || path.isAbsolute(relative))
    throw new Error(`${label}: path escapes public directory`)
  return filename
}

async function localBytes(publicDir, url, prefix, label, optional = false) {
  const filename = localPath(publicDir, url, prefix, label)
  try {
    const resolved = await realpath(filename)
    const relative = path.relative(await realpath(publicDir), resolved)
    if (relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error(`${label}: path escapes public directory`)
    return await readFile(filename)
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (optional) return null
      throw new Error(
        `${label}: missing file ${url}. Fix the path, or set photo to null for a placeholder.`,
        { cause: error },
      )
    }
    throw error
  }
}

/** Rebuild derived media before Vite; publish a manifest only after all images decode. */
export async function generateAssets({ root, warn = console.warn }) {
  root = path.resolve(root)
  const publicDir = path.join(root, 'public')
  const dataDir = path.join(root, 'src/data')
  const outDir = path.join(publicDir, 'images/optimized')
  const people = await readJson(path.join(dataDir, 'people.json'))
  const links = await readJson(path.join(dataDir, 'links.json'))
  validateSettings(people, links)
  const outputs = new Map()
  const assets = { logo: '', games: Object.create(null), members: Object.create(null) }

  async function convert(bytes, name, options, label) {
    try {
      const image = sharp(bytes, { failOn: 'error', limitInputPixels: 40_000_000 }).autoOrient()
      const { format } = await image.metadata()
      if (!['png', 'jpeg', 'webp', 'heif', 'gif', 'tiff'].includes(format))
        throw new Error('expected a raster image (PNG, JPEG, WebP, AVIF, GIF or TIFF)')
      if (options.trim) image.trim({ background: '#00000000', threshold: 5 })
      const { data, info } = await image
        .resize(options.resize)
        .webp({
          quality: options.quality ?? 82,
          alphaQuality: options.alphaQuality ?? 92,
          effort: 5,
        })
        .toBuffer({ resolveWithObject: true })
      const filename = `${name}.${hash(data).slice(0, 16)}.webp`
      outputs.set(filename, data)
      return { src: `/images/optimized/${filename}`, width: info.width, height: info.height }
    } catch (error) {
      throw new Error(`${label}: cannot decode image (${error.message})`, { cause: error })
    }
  }

  const logoBytes = await localBytes(publicDir, '/images/logo.png', '/images/', 'logo')
  assets.logo = (
    await convert(
      logoBytes,
      'logo',
      {
        resize: { width: 512, withoutEnlargement: true },
        quality: 85,
        alphaQuality: 100,
      },
      'logo /images/logo.png',
    )
  ).src

  for (const person of people) {
    const label = `${person.username} photo ${person.photo ?? '(placeholder)'}`
    const source =
      person.photo == null
        ? null
        : await localBytes(publicDir, person.photo, '/images/members/', label)
    const input = source ?? logoBytes
    const variants = []
    for (const [suffix, width, height] of [
      ['portrait', 960, 1200],
      ['preview', 480, 640],
      ['thumb', 112, 112],
    ]) {
      variants.push(
        await convert(
          input,
          `${source ? person.username : 'fallback'}-${suffix}`,
          {
            trim: true,
            resize:
              suffix === 'thumb'
                ? { width, height, fit: 'contain', background: '#00000000' }
                : { width, height, fit: 'inside', withoutEnlargement: true },
          },
          label,
        ),
      )
    }
    let audio = null
    if (person.audio) {
      const audioBytes = await localBytes(
        publicDir,
        person.audio,
        '/audio/',
        `${person.username} audio`,
        true,
      )
      if (audioBytes?.length) audio = person.audio
      else
        warn(`${person.username}: optional audio unavailable (${person.audio}); playback disabled`)
    }
    assets.members[person.username] = {
      photo: variants[0].src,
      preview: variants[1].src,
      thumbnail: variants[2].src,
      width: variants[0].width,
      height: variants[0].height,
      previewWidth: variants[1].width,
      source: person.photo ?? null,
      sourceHash: hash(input),
      audio,
      missingPhoto: source === null,
    }
  }
  const gamesDir = path.join(publicDir, 'images/games')
  for (const filename of (await readdir(gamesDir)).sort()) {
    if (!filename.endsWith('.png')) continue
    const key = filename.slice(0, -4)
    if (!/^[a-z0-9_-]+$/.test(key)) throw new Error(`games: invalid image filename ${filename}`)
    const url = `/images/games/${filename}`
    assets.games[key] = (
      await convert(
        await localBytes(publicDir, url, '/images/games/', 'game'),
        `game-${key}`,
        {
          resize: { width: 256, height: 256, fit: 'inside', withoutEnlargement: true },
          quality: 85,
          alphaQuality: 100,
        },
        `game ${url}`,
      )
    ).src
  }

  // This folder contains generated WebP files only. Never recursively delete source directories.
  await mkdir(outDir, { recursive: true })
  const resolvedOut = await realpath(outDir)
  if (
    (await lstat(outDir)).isSymbolicLink() ||
    resolvedOut !== path.join(await realpath(publicDir), 'images/optimized')
  )
    throw new Error('Generated output path must stay inside public/images/optimized')
  for (const [filename, bytes] of outputs) await writeFile(path.join(outDir, filename), bytes)
  await writeFile(path.join(dataDir, 'assets.json'), `${JSON.stringify(assets, null, 2)}\n`)
  for (const entry of await readdir(outDir, { withFileTypes: true }))
    if (
      entry.isFile() &&
      /^[a-z0-9_-]+(?:\.[a-f0-9]{16})?\.webp$/.test(entry.name) &&
      !outputs.has(entry.name)
    )
      await unlink(path.join(outDir, entry.name))
  return assets
}
