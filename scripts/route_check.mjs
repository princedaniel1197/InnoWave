/**
 * Route check — every route returns 200, and every asset it references resolves.
 *
 *   node scripts/route_check.mjs [baseUrl]
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const projects = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))

const routes = [
  '/',
  ...projects.map(p => `/site/${p.id}/`),
  ...projects.map(p => `/record/${p.id}/`),
]

let bad = 0

for (const route of routes) {
  const res = await fetch(BASE + route)
  const html = res.ok ? await res.text() : ''

  // Every local asset the page references
  const assets = [
    ...new Set(
      [...html.matchAll(/(?:src|href)="(\/(?:photos|frames|brand|_next)[^"]*)"/g)].map(m => m[1])
    ),
  ]

  const broken = []
  for (const a of assets) {
    const r = await fetch(BASE + a, { method: 'HEAD' })
    if (!r.ok) broken.push(`${a} -> ${r.status}`)
  }

  const ok = res.ok && broken.length === 0
  if (!ok) bad++
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  ${route.padEnd(34)} HTTP ${res.status}  ${assets.length} assets` +
      (broken.length ? `\n        broken: ${broken.join(', ')}` : '')
  )
}

console.log(`\n${routes.length - bad}/${routes.length} routes clean`)
if (bad) process.exit(1)
