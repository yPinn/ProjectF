import { fileURLToPath } from 'node:url'
import { generateAssets } from './lib/assets.mjs'

try {
  const assets = await generateAssets({ root: fileURLToPath(new URL('../', import.meta.url)) })
  console.log(
    `Media ready: ${Object.keys(assets.members).length} members; content-hashed WebP URLs`,
  )
} catch (error) {
  console.error(`Asset build failed: ${error.message}`)
  process.exitCode = 1
}
