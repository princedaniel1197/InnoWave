import type { Project, ProjectStatus, Provenance } from './types'

/**
 * Enforcement of CLAUDE.md rule 4. Everything a screen needs to know about how
 * honestly to render an entity comes from here — no screen decides for itself.
 */

/** Divergence beyond this many points is treated as a real gap, not measurement noise. */
export const TOLERANCE_POINTS = 8

/** The only statuses a REAL entity may hold. Both are green/neutral. */
export const REAL_ALLOWED_STATUSES: ProjectStatus[] = ['verified', 'monitored']

/** Placeholder literals that must never be replaced with invented values. */
export const PENDING_RERA = 'FILL_FROM_KRERA_PORTAL'
export const PENDING_DATE = 'PENDING_VERIFICATION'

export const SYNTHETIC_CHIP = 'SYNTHETIC — ILLUSTRATIVE'
export const ROADMAP_CHIP = 'ROADMAP'

export function isSynthetic(p: Project): boolean {
  return p.provenance === 'SYNTHETIC'
}

export function isReal(p: Project): boolean {
  return p.provenance === 'REAL'
}

/** True when any identifying field is still awaiting founder input. */
export function isDataPending(p: Project): boolean {
  return p.rera_no === PENDING_RERA || p.declared_series.some(d => d.pct < 0)
}

export function statusLabel(s: ProjectStatus): string {
  switch (s) {
    case 'verified': return 'VERIFIED'
    case 'monitored': return 'MONITORED'
    case 'watch': return 'WATCH'
    case 'divergence': return 'DIVERGENCE'
  }
}

/** Token name, not a raw colour — screens map this through Tailwind. */
export function statusColor(s: ProjectStatus): 'green' | 'green-muted' | 'amber' | 'red' {
  switch (s) {
    case 'verified': return 'green'
    case 'monitored': return 'green-muted'
    case 'watch': return 'amber'
    case 'divergence': return 'red'
  }
}

export function statusHex(s: ProjectStatus): string {
  switch (s) {
    case 'verified': return '#22C55E'
    case 'monitored': return '#4E8F68'
    case 'watch': return '#F59E0B'
    case 'divergence': return '#EF4444'
  }
}

export function latestPoint<T extends { date: string }>(series: T[]): T | null {
  if (!series.length) return null
  return series.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a))
}

export interface DivergenceReading {
  declaredPct: number | null
  observedPct: number | null
  /** Positive = observed lags declared. */
  points: number | null
  /** True only when the gap exceeds tolerance. Never true for a REAL entity. */
  beyondTolerance: boolean
  /** Plain-language sentence for the VPR document. */
  sentence: string
}

/**
 * The single place divergence is computed. A REAL entity can never be
 * reported beyond tolerance — `assertProvenanceInvariants` guarantees the
 * underlying data can never reach that state, and this function refuses to
 * emit the flag regardless.
 */
export function readDivergence(p: Project): DivergenceReading {
  const d = latestPoint(p.declared_series)
  const o = latestPoint(p.observed_series)

  if (!d || !o || d.pct < 0 || o.pct < 0) {
    return {
      declaredPct: d && d.pct >= 0 ? d.pct : null,
      observedPct: o && o.pct >= 0 ? o.pct : null,
      points: null,
      beyondTolerance: false,
      sentence:
        'Insufficient data to state a reconciliation. Declared or observed figures are pending founder input.',
    }
  }

  const points = d.pct - o.pct
  const beyondTolerance = isReal(p) ? false : points > TOLERANCE_POINTS

  let sentence: string
  if (beyondTolerance) {
    sentence =
      `Observed physical progress is ${points} percentage points below the progress declared ` +
      `by the promoter as of ${d.date}. The two records do not agree.`
  } else if (Math.abs(points) <= TOLERANCE_POINTS) {
    sentence =
      `Observed physical progress agrees with the progress declared by the promoter, within the ` +
      `${TOLERANCE_POINTS}-point observation tolerance of this method (declared ${d.pct}%, observed ${o.pct}%).`
  } else {
    sentence =
      `Observed physical progress is ${Math.abs(points)} percentage points above the declared figure ` +
      `as of ${d.date}.`
  }

  return { declaredPct: d.pct, observedPct: o.pct, points, beyondTolerance, sentence }
}

/**
 * Build-time guard. Imported by data/index so a violation fails the build
 * rather than reaching a judge's screen.
 */
export function assertProvenanceInvariants(projects: Project[]): void {
  const fail = (m: string) => {
    throw new Error(`[provenance] ${m} — see CLAUDE.md rule 4`)
  }

  for (const p of projects) {
    const prov: Provenance = p.provenance
    if (prov !== 'REAL' && prov !== 'SYNTHETIC') {
      fail(`"${p.id}" has provenance "${prov}"; must be REAL or SYNTHETIC`)
    }

    if (prov === 'REAL') {
      if (!REAL_ALLOWED_STATUSES.includes(p.status)) {
        fail(`REAL entity "${p.id}" holds fault-implying status "${p.status}"`)
      }

      const d = latestPoint(p.declared_series)
      const o = latestPoint(p.observed_series)
      if (d && o && d.pct >= 0 && o.pct >= 0 && d.pct - o.pct > TOLERANCE_POINTS) {
        fail(
          `REAL entity "${p.id}" would render a ${d.pct - o.pct}-point divergence ` +
            `(declared ${d.pct}%, observed ${o.pct}%). A real project may not carry a fault claim. ` +
            `Correct the data or reclassify.`
        )
      }
    }

    if (prov === 'SYNTHETIC' && !p.scenario_note) {
      fail(`SYNTHETIC entity "${p.id}" is missing scenario_note`)
    }

    for (const pt of [...p.declared_series, ...p.observed_series]) {
      if (!pt.interpolated && !pt.source && !pt.basis) {
        fail(`"${p.id}" point ${pt.date} claims to be backed but cites no source or basis`)
      }
    }
  }
}
