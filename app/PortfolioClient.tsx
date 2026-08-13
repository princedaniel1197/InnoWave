'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { Project } from '@/lib/types'
import { PORTFOLIO, displayName, displayPromoter, displayRera } from '@/lib/data'
import { readDivergence, statusHex } from '@/lib/provenance'
import PortfolioMap from '@/components/map/PortfolioMap'
import { Label, PendingChip, ProvenanceChip, StatusChip } from '@/components/Chips'

const LEGEND: { status: Project['status']; label: string; note: string }[] = [
  { status: 'verified', label: 'Verified', note: 'Record issued; declared and observed agree' },
  { status: 'monitored', label: 'Monitored', note: 'In portfolio; awaiting source data' },
  { status: 'watch', label: 'Watch', note: 'Gap opening between declared and observed' },
  { status: 'divergence', label: 'Divergence', note: 'Observed materially below declared' },
]

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-background px-5 py-4">
      <Label>{label}</Label>
      <div className="font-syne text-[1.75rem] leading-none font-bold text-off-white mt-2 tabular">
        {value}
      </div>
      {sub && <div className="font-mono text-[9px] text-dim mt-1.5 tracking-wide">{sub}</div>}
    </div>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const div = readDivergence(p)
  const pending = p.rera_no === 'FILL_FROM_KRERA_PORTAL'

  return (
    <div className="bg-surface border border-border rounded-sm animate-fade-up">
      <div
        className="h-[2px] w-full rounded-t-sm"
        style={{ background: statusHex(p.status) }}
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusChip status={p.status} />
          <ProvenanceChip p={p} />
          {pending && <PendingChip />}
        </div>

        <h2 className="font-syne text-lg font-bold text-off-white leading-tight">
          {displayName(p)}
        </h2>
        <div className="text-sm text-gray-light mt-0.5">{displayPromoter(p)}</div>
        <div className="font-mono text-[10px] text-gold mt-1.5 break-all leading-relaxed">
          {displayRera(p)}
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim mt-1">
          {p.location.label}
          {p.location.approx && ' · approx.'}
        </div>

        {p.scenario_note && (
          <p className="text-[11px] text-gray-light leading-relaxed mt-3 border-l-2 border-amber/40 pl-2.5">
            {p.scenario_note}
          </p>
        )}

        <div className="grid grid-cols-3 gap-px bg-border mt-4 rounded-sm overflow-hidden">
          <div className="bg-surface px-3 py-2.5">
            <Label>Declared</Label>
            <div className="font-mono text-base text-gold mt-1 tabular">
              {div.declaredPct === null ? '—' : `${div.declaredPct}%`}
            </div>
          </div>
          <div className="bg-surface px-3 py-2.5">
            <Label>Observed</Label>
            <div className="font-mono text-base text-off-white mt-1 tabular">
              {div.observedPct === null ? '—' : `${div.observedPct}%`}
            </div>
          </div>
          <div className="bg-surface px-3 py-2.5">
            <Label>Gap</Label>
            <div
              className="font-mono text-base mt-1 tabular"
              style={{ color: div.beyondTolerance ? '#EF4444' : '#9090AA' }}
            >
              {div.points === null ? '—' : `${div.points > 0 ? '' : '+'}${Math.abs(div.points)} pt`}
            </div>
          </div>
        </div>

        <Link
          href={`/site/${p.id}`}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gold text-background font-mono text-[11px] uppercase tracking-[0.14em] px-4 py-2.5 rounded-sm hover:bg-gold-light transition-colors"
        >
          Open site →
        </Link>
      </div>
    </div>
  )
}

export default function PortfolioClient({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <div className="max-w-[1500px] mx-auto px-6 sm:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-display text-3xl sm:text-4xl text-off-white leading-tight">
          Verified Progress Record
        </h1>
        <p className="text-sm text-gray-light mt-1.5 max-w-[62ch] leading-relaxed">
          An independently produced, evidence-backed record of what has physically been built on a
          site as of a date — reconciled against the progress the promoter declared.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Map */}
        <div className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
            <Label>Karnataka · Monitored Portfolio</Label>
            <span className="font-mono text-[9px] text-dim uppercase tracking-[0.16em]">
              {projects.length} sites
            </span>
          </div>
          <div className="h-[420px] sm:h-[520px]">
            <PortfolioMap
              projects={projects}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </div>

          {/* Legend */}
          <div className="border-t border-border px-5 py-3 flex flex-wrap gap-x-6 gap-y-2">
            {LEGEND.map(l => (
              <div key={l.status} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: statusHex(l.status) }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
                  {l.label}
                </span>
                <span className="text-[10px] text-dim hidden xl:inline">— {l.note}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-amber text-amber font-mono text-[8px] leading-[13px] text-center shrink-0">
                S
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
                Synthetic
              </span>
            </div>
          </div>
        </div>

        {/* Rail */}
        <div className="flex flex-col gap-5">
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface">
              <Label>Portfolio</Label>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              <Kpi label="Projects monitored" value={String(PORTFOLIO.monitored)} />
              <Kpi
                label="Records issued"
                value={String(PORTFOLIO.recordsIssued)}
                sub={`${PORTFOLIO.awaitingData} awaiting data`}
              />
              <Kpi
                label="Divergences flagged"
                value={String(PORTFOLIO.divergencesFlagged)}
                sub="this quarter · synthetic"
              />
              <Kpi label="Satellite baseline" value="ACTIVE" sub="archive imagery" />
              <div className="col-span-2 bg-background px-5 py-4">
                <Label>Drone capture</Label>
                <div className="font-syne text-[1.75rem] leading-none font-bold text-off-white mt-2">
                  ON TRIGGER
                </div>
                <div className="font-mono text-[9px] text-dim mt-1.5 tracking-wide">
                  dispatched when a gap opens
                </div>
              </div>
            </div>
          </div>

          {/* Selection */}
          {selected ? (
            <ProjectCard key={selected.id} p={selected} />
          ) : (
            <div className="bg-surface border border-border rounded-sm p-5">
              <Label>Selection</Label>
              <p className="text-sm text-gray-light mt-3 leading-relaxed">
                Select a pin on the map to see the declared and observed position for that site, and
                to open its record.
              </p>
              <div className="mt-4 space-y-1.5">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-sm border border-transparent hover:border-gold/30 hover:bg-gold/[0.04] transition-colors"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: statusHex(p.status) }}
                    />
                    <span className="text-[13px] text-gray-light truncate flex-1">
                      {displayName(p)}
                    </span>
                    {p.provenance === 'SYNTHETIC' && (
                      <span className="font-mono text-[8px] text-amber shrink-0">S</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-dim mt-6 leading-relaxed max-w-[80ch]">
        Demonstration build. Projects marked SYNTHETIC — ILLUSTRATIVE are fictional scenarios; no
        real developer, project or filing is depicted by them. Fields marked data pending are
        awaiting source data from the K-RERA portal and have not been filled with estimates.
      </p>
    </div>
  )
}
