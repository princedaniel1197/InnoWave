import type { Project, ProjectStatus } from '@/lib/types'
import { ROADMAP_CHIP, SYNTHETIC_CHIP, statusLabel } from '@/lib/provenance'

/**
 * Every honesty marker in the app is one of these. They are deliberately the
 * only way to render provenance, roadmap and pending state, so a sweep can be
 * done by grepping this file's call sites. See CLAUDE.md rules 4 and 9.
 */

const BASE =
  'inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] ' +
  'px-2 py-[3px] rounded-sm border whitespace-nowrap'

/** SYNTHETIC — ILLUSTRATIVE. Must appear everywhere a synthetic entity renders. */
export function SyntheticChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`${BASE} border-amber/40 bg-amber/[0.08] text-amber ${className}`}
      title="Illustrative scenario. No real developer, project or filing is depicted."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber" />
      {SYNTHETIC_CHIP}
    </span>
  )
}

/** Shown on REAL entities so the contrast with SYNTHETIC is explicit. */
export function RealChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`${BASE} border-green/30 bg-green/[0.06] text-green ${className}`}
      title="Real project. Used with the promoter's permission."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green" />
      REAL PROJECT
    </span>
  )
}

export function ProvenanceChip({ p, className }: { p: Project; className?: string }) {
  return p.provenance === 'SYNTHETIC' ? (
    <SyntheticChip className={className} />
  ) : (
    <RealChip className={className} />
  )
}

/** ROADMAP — a capability that is not built. Never present these as live. */
export function RoadmapChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`${BASE} border-blue/35 bg-blue/[0.07] text-blue ${className}`}
      title="Roadmap capability. Not built, not running, not part of this demonstration."
    >
      {ROADMAP_CHIP}
    </span>
  )
}

/** Data awaiting founder input from the K-RERA portal. */
export function PendingChip({
  label = 'DATA PENDING',
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <span
      className={`${BASE} border-border-soft bg-surface2 text-gray-light ${className}`}
      title="Awaiting source data. No value has been invented to fill this field."
    >
      {label}
    </span>
  )
}

/** Imagery in this series has not been exported yet. */
export function PlaceholderImageryChip({ className = '' }: { className?: string }) {
  return (
    <span
      className={`${BASE} border-border-soft bg-surface2 text-gray-light ${className}`}
      title="These frames are generated placeholders, not site imagery."
    >
      PLACEHOLDER IMAGERY
    </span>
  )
}

const STATUS_STYLE: Record<ProjectStatus, string> = {
  verified: 'border-green/35 bg-green/[0.07] text-green',
  monitored: 'border-[#4E8F68]/40 bg-[#4E8F68]/[0.08] text-[#6FAE88]',
  watch: 'border-amber/40 bg-amber/[0.07] text-amber',
  divergence: 'border-red/40 bg-red/[0.07] text-red',
}

const STATUS_DOT: Record<ProjectStatus, string> = {
  verified: 'bg-green',
  monitored: 'bg-[#4E8F68]',
  watch: 'bg-amber',
  divergence: 'bg-red',
}

export function StatusChip({ status, className = '' }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={`${BASE} ${STATUS_STYLE[status]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {statusLabel(status)}
    </span>
  )
}

/** Section label — the Vantis fingerprint. */
export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-mono text-[9px] uppercase tracking-[0.22em] text-gray ${className}`}>
      {children}
    </div>
  )
}
