import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('../', import.meta.url))
const build = spawnSync(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    'build',
    '--ssr',
    'functions/api/clips.ts',
    '--outDir',
    '.tools/clip-tests',
    '--emptyOutDir',
  ],
  { cwd, stdio: 'inherit' },
)
if (build.status !== 0) process.exit(build.status ?? 1)
const tests = spawnSync(process.execPath, ['--test', 'scripts/clips.test.mjs'], {
  cwd,
  stdio: 'inherit',
})
process.exit(tests.status ?? 1)
