/**
 * Honesty sweep — the release gate for CLAUDE.md rules 4 and 9.
 *
 * Walks every route on a running server and asserts the provenance
 * invariants against the rendered HTML, not against intent.
 *
 *   npm run dev          (in another terminal)
 *   node scripts/honesty_sweep.mjs [baseUrl]
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')

const projects = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))

const results = []
const pass = (name, detail = '') => results.push({ ok: true, name, detail })
const fail = (name, detail) => results.push({ ok: false, name, detail })

/** Strip tags and collapse whitespace so phrase checks are reliable. */
function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  return text(await res.text())
}

/* Phrases that assert a fault. None of these may appear on a REAL entity's own pages. */
const FAULT_PHRASES = [
  'do not agree',
  'beyond the 8-point',
  'gap beyond',
  'materially below',
  'divergence flagged',
  'high risk',
  'risk score',
  'default',
  'breach',
  'non-compliant',
  'misstat',
  'fraud',
  'notice issued',
]

async function main() {
  console.log(`honesty sweep -> ${BASE}\n`)

  const real = projects.filter(p => p.provenance === 'REAL')
  const synth = projects.filter(p => p.provenance === 'SYNTHETIC')

  /* ── 1. Every synthetic entity is chipped everywhere it renders ────────── */
  for (const p of synth) {
    for (const route of [`/site/${p.id}/`, `/record/${p.id}/`]) {
      const t = await get(route)
      const chipped = t.includes('SYNTHETIC — ILLUSTRATIVE') || t.includes('Synthetic — illustrative')
      chipped
        ? pass(`synthetic chipped on ${route}`)
        : fail(`synthetic chipped on ${route}`, 'no SYNTHETIC — ILLUSTRATIVE marker found')
    }
  }
  {
    const t = await get('/')
    const missing = synth.filter(p => !t.includes(p.name))
    missing.length === 0 && t.includes('SYNTHETIC')
      ? pass('synthetic marked on portfolio route')
      : fail('synthetic marked on portfolio route', `missing: ${missing.map(m => m.name).join(', ')}`)
  }

  /* ── 2. Synthetic records carry the synthetic watermark ───────────────── */
  for (const p of synth) {
    const t = await get(`/record/${p.id}/`)
    t.includes('SPECIMEN — SYNTHETIC SCENARIO')
      ? pass(`synthetic watermark on /record/${p.id}`)
      : fail(`synthetic watermark on /record/${p.id}`, 'expected SPECIMEN — SYNTHETIC SCENARIO')
  }

  /* ── 3. Every record carries a SPECIMEN watermark and the disclaimer ──── */
  for (const p of projects) {
    const t = await get(`/record/${p.id}/`)
    const wm = t.includes('SPECIMEN')
    const dis = t.toLowerCase().includes('not issued for reliance')
    wm && dis
      ? pass(`specimen + disclaimer on /record/${p.id}`)
      : fail(`specimen + disclaimer on /record/${p.id}`, `watermark=${wm} disclaimer=${dis}`)
  }

  /* ── 4. No REAL entity's own pages carry a fault claim ────────────────── */
  for (const p of real) {
    for (const route of [`/site/${p.id}/`, `/record/${p.id}/`]) {
      const t = (await get(route)).toLowerCase()
      const hits = FAULT_PHRASES.filter(f => t.includes(f))
      hits.length === 0
        ? pass(`no fault claim on ${route}`)
        : fail(`no fault claim on ${route}`, `found: ${hits.join(', ')}`)
    }
  }

  /* ── 5. Roadmap capabilities are labelled wherever referenced ─────────── */
  for (const p of projects) {
    const t = await get(`/site/${p.id}/`)
    if (t.toLowerCase().includes('change-detection')) {
      t.includes('ROADMAP')
        ? pass(`roadmap labelled on /site/${p.id}`)
        : fail(`roadmap labelled on /site/${p.id}`, 'change-detection referenced without ROADMAP chip')
    }
  }

  /* ── 6. Interpolated points are labelled where they exist ─────────────── */
  for (const p of projects) {
    const hasInterp = [...p.declared_series, ...p.observed_series].some(
      x => x.interpolated && x.pct >= 0
    )
    if (!hasInterp) continue
    const t = await get(`/site/${p.id}/`)
    t.toLowerCase().includes('interpolated')
      ? pass(`interpolated labelled on /site/${p.id}`)
      : fail(`interpolated labelled on /site/${p.id}`, 'series has interpolated points, no label found')
  }

  /* ── 7. Placeholder imagery is chipped ────────────────────────────────── */
  for (const p of projects) {
    if (!p.frames_manifest) continue
    const manifest = JSON.parse(readFileSync(join(ROOT, p.frames_manifest), 'utf8'))
    if (!manifest.frames.some(f => f.status === 'placeholder')) continue
    const t = await get(`/site/${p.id}/`)
    t.includes('PLACEHOLDER IMAGERY') || t.includes('placeholder imagery')
      ? pass(`placeholder imagery chipped on /site/${p.id}`)
      : fail(`placeholder imagery chipped on /site/${p.id}`, 'expected PLACEHOLDER IMAGERY chip')
  }

  /* ── 8. Pending fields render a chip and never a fabricated value ─────── */
  for (const p of projects) {
    if (p.rera_no !== 'FILL_FROM_KRERA_PORTAL') continue
    const t = await get(`/site/${p.id}/`)
    const chipped = t.includes('DATA PENDING') || t.includes('data pending')
    const leaked = t.includes('FILL_FROM_KRERA_PORTAL')
    chipped && !leaked
      ? pass(`pending data chipped on /site/${p.id}`)
      : fail(`pending data chipped on /site/${p.id}`, `chip=${chipped} rawPlaceholderLeaked=${leaked}`)
  }

  /* ── 9. The DEMONSTRATION tag is on every route ───────────────────────── */
  for (const p of projects) {
    for (const route of ['/', `/site/${p.id}/`, `/record/${p.id}/`]) {
      const t = await get(route)
      if (!t.includes('Demonstration') && !t.includes('DEMONSTRATION')) {
        fail(`demonstration tag on ${route}`, 'missing')
      }
    }
  }
  if (!results.some(r => !r.ok && r.name.startsWith('demonstration tag'))) {
    pass('demonstration tag on every route')
  }

  /* ── Report ───────────────────────────────────────────────────────────── */
  const failed = results.filter(r => !r.ok)
  const width = Math.max(...results.map(r => r.name.length))
  for (const r of results) {
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(width)}${r.detail ? '  ' + r.detail : ''}`)
  }
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)

  if (failed.length) {
    console.error(`\nHONESTY SWEEP FAILED — ${failed.length} check(s)`)
    process.exit(1)
  }
  console.log('HONESTY SWEEP PASSED')
}

main().catch(e => {
  console.error(e.message)
  process.exit(1)
})
