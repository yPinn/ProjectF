// Run with Node.js and sharp installed, or pass the bundled sharp module path as argv[2].
import { readFile, writeFile, mkdir, stat, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const { default: sharp } = await import(
  process.argv[2] ? pathToFileURL(path.resolve(process.argv[2])).href : 'sharp'
)
const root = fileURLToPath(new URL('../', import.meta.url))
const publicDir = path.join(root, 'public')
const outDir = path.join(publicDir, 'images/optimized')
await mkdir(outDir, { recursive: true })
const people = JSON.parse(await readFile(path.join(root, 'src/data/people.json'), 'utf8'))
const assets = {}
let before = 0
let after = 0

for (const person of people) {
  const source = path.join(publicDir, person.photo.replace(/^\//, ''))
  const available = existsSync(source)
  const input = available ? source : path.join(publicDir, 'images/logo.png')
  const sizes = []
  for (const [suffix, width, height] of [
    ['portrait', 960, 1200],
    ['preview', 480, 640],
    ['thumb', 112, 112],
  ]) {
    const filename = `${available ? person.username : 'fallback'}-${suffix}.webp`
    const output = path.join(outDir, filename)
    const image = sharp(input).trim({ background: '#00000000', threshold: 5 })
    if (suffix === 'thumb') {
      image.resize(width, height, { fit: 'contain', background: '#00000000' })
    } else {
      image.resize({ width, height, fit: 'inside', withoutEnlargement: true })
    }
    const info = await image.webp({ quality: 82, alphaQuality: 92, effort: 5 }).toFile(output)
    sizes.push({ src: `/images/optimized/${filename}`, width: info.width, height: info.height })
    after += (await stat(output)).size
  }
  if (available) before += (await stat(source)).size
  assets[person.username] = {
    photo: sizes[0].src,
    preview: sizes[1].src,
    thumbnail: sizes[2].src,
    width: sizes[0].width,
    height: sizes[0].height,
    previewWidth: sizes[1].width,
    audio:
      person.audio && existsSync(path.join(publicDir, person.audio.replace(/^\//, '')))
        ? person.audio
        : null,
    missingPhoto: !available,
  }
}
await sharp(path.join(publicDir, 'images/logo.png'))
  .resize({ width: 512, withoutEnlargement: true })
  .webp({ quality: 85, alphaQuality: 100 })
  .toFile(path.join(outDir, 'logo.webp'))
for (const filename of await readdir(path.join(publicDir, 'images/games'))) {
  if (!filename.endsWith('.png')) continue
  await sharp(path.join(publicDir, 'images/games', filename))
    .resize({ width: 256, height: 256, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 100 })
    .toFile(path.join(outDir, `game-${filename.replace(/\.png$/, '.webp')}`))
}
await writeFile(path.join(root, 'src/data/assets.json'), `${JSON.stringify(assets, null, 2)}\n`)
console.log(
  JSON.stringify(
    { originalPortraitBytes: before, allPortraitVariantsBytes: after, members: people.length },
    null,
    2,
  ),
)
