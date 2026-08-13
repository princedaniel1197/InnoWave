'use client'

import Link from 'next/link'

import type { FramesManifest, PhotosManifest, Project } from '@/lib/types'
import { displayName, displayPromoter, displayRera } from '@/lib/data'
import {
  TOLERANCE_POINTS,
  canPlotSeries,
  hasAnyProgressData,
  isSynthetic,
  readDivergence,
} from '@/lib/provenance'
import CertifiedPoint from '@/components/site/CertifiedPoint'
import DivergenceChart from '@/components/site/DivergenceChart'
import PhotoStrip from '@/components/site/PhotoStrip'
import ProjectFacts from '@/components/site/ProjectFacts'
import WipeSlider from '@/components/site/WipeSlider'
import {
  Label,
  PendingChip,
  ProvenanceChip,
  RoadmapChip,
  StatusChip,
  SyntheticChip,
} from '@/components/Chips'

function Stat({
  label,
  value,
  cite,
  colour,
}: {
  label: string
  value: string
  cite: string
  colour?: string
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <Label>{label}</Label>
      <div
        className="font-syne text-[2rem] leading-none font-bold mt-2 tabular"
        style={{ color: colour ?? '#F0EEE8' }}
      >
        {value}
      </div>
      <div className="text-[10px] text-dim mt-2 leading-snug">{cite}</div>
    </div>
  )
}

export default function SiteContent({
  project,
  frames,
  photos,
}: {
  project: Project
  frames: FramesManifest | null
  photos: PhotosManifest | null
}) {
  const p = project
  const div = readDivergence(p)
  const synth = isSynthetic(p)
  const pending = p.rera_no === 'FILL_FROM_KRERA_PORTAL'

  const declaredCite =
    p.declared_series.length && div.declaredPct !== null
      ? p.declared_series[p.declared_series.length - 1].source ?? '—'
      : 'awaiting source data from the K-RERA portal'

  const observedCite =
    p.observed_series.length && div.observedPct !== null
      ? p.observed_series[p.observed_series.length - 1].basis ?? '—'
      : 'no capture reconciled yet'

  return (
    <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-6">
      {/* Synthetic banner — persistent, above everything */}
      {synth && (
        <div className="mb-5 border border-amber/40 bg-amber/[0.06] rounded-sm px-5 py-3.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber mb-1">
            Synthetic project — illustrative scenario
          </div>
          <p className="text-[12px] text-gray-light leading-relaxed">
            No real developer is depicted. {p.scenario_note}
          </p>
        </div>
      )}

      {/* 1 — Header */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <StatusChip status={p.status} />
          <ProvenanceChip p={p} />
          {pending && <PendingChip />}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-off-white leading-tight">
          {displayName(p)}
        </h1>
        <div className="text-sm text-gray-light mt-1">{displayPromoter(p)}</div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <span className="font-mono text-[11px] text-gold break-all">{displayRera(p)}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
            {p.location.label}
            {p.location.approx && ' · coordinates approximate'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* 2 — Imagery timeline */}
        {frames ? (
          <WipeSlider manifest={frames} projectId={p.id} />
        ) : (
          <section className="bg-surface border border-border rounded-sm">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
              <Label>Imagery Timeline</Label>
              <PendingChip label="No frames exported" />
            </div>
            <p className="px-5 py-8 text-sm text-gray-light text-center">
              No imagery series has been exported for this site yet.
            </p>
          </section>
        )}

        {/* 3 — Evidence position.
            A two-line curve is drawn only where a trajectory exists on both
            sides. With one certified observation, drawing a line would imply
            filings that do not exist. */}
        {!hasAnyProgressData(p) ? (
          <section className="bg-surface border border-border rounded-sm">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
              <Label>Evidence Position</Label>
              <PendingChip label="No figures on file" />
            </div>
            <p className="px-5 py-8 text-sm text-gray-light text-center max-w-[60ch] mx-auto leading-relaxed">
              No declared or observed figure has been retrieved for this site. Nothing has been
              estimated in their place.
            </p>
          </section>
        ) : canPlotSeries(p) ? (
          <DivergenceChart p={p} />
        ) : (
          <CertifiedPoint p={p} />
        )}

        {/* 4 — Headline stats */}
        <section className="border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface">
            <Label>Position as of latest reconciliation</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
            <Stat
              label="Declared"
              value={div.declaredPct === null ? '—' : `${div.declaredPct}%`}
              cite={declaredCite}
              colour="#C9A84C"
            />
            <Stat
              label="Observed"
              value={div.observedPct === null ? '—' : `${div.observedPct}%`}
              cite={observedCite}
            />
            {/* "Divergence" is a finding. A REAL entity within tolerance gets
                the neutral word — CLAUDE.md rule 4. */}
            <Stat
              label={div.beyondTolerance ? 'Divergence' : 'Gap'}
              value={div.points === null ? '—' : `${Math.abs(div.points)} pt`}
              cite={
                div.points === null
                  ? 'not computable until both figures exist'
                  : div.beyondTolerance
                    ? `beyond the ${TOLERANCE_POINTS}-point observation tolerance`
                    : `within the ${TOLERANCE_POINTS}-point observation tolerance`
              }
              colour={div.beyondTolerance ? '#EF4444' : '#9090AA'}
            />
          </div>
          <div className="bg-surface border-t border-border px-5 py-3.5">
            <p className="text-[12px] text-gray-light leading-relaxed">{div.sentence}</p>
          </div>
        </section>

        {/* 5 — Ground record */}
        {photos && <PhotoStrip manifest={photos} projectId={p.id} />}

        {/* 5b — Registry & filings */}
        <ProjectFacts p={p} />

        {/* 5c — The argument this project carries */}
        {p.thesis && (
          <section
            className={`border rounded-sm ${
              synth ? 'border-amber/30 bg-amber/[0.03]' : 'border-border-gold bg-gold/[0.03]'
            }`}
          >
            <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
              <Label>{p.thesis.heading}</Label>
              {synth && <SyntheticChip />}
            </div>
            <div className="px-5 py-4 space-y-3 max-w-[86ch]">
              {p.thesis.body.map((para, i) => (
                <p key={i} className="text-[13px] text-gray-light leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 6 — Footer actions */}
        <section className="bg-surface border border-border rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href={`/record/${p.id}`}
              className="inline-flex items-center justify-center gap-2 bg-gold text-background font-mono text-[11px] uppercase tracking-[0.14em] px-5 py-3 rounded-sm hover:bg-gold-light transition-colors shrink-0"
            >
              Issue Verified Progress Record →
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                disabled
                aria-disabled="true"
                title="Roadmap capability. Not built and not running in this demonstration."
                className="inline-flex items-center gap-2 border border-border bg-background text-dim font-mono text-[11px] uppercase tracking-[0.14em] px-5 py-3 rounded-sm cursor-not-allowed opacity-60"
              >
                Run change-detection analysis
              </button>
              <RoadmapChip />
            </div>
          </div>

          <p className="text-[11px] text-dim mt-4 leading-relaxed max-w-[80ch]">
            Automated change detection, computer-vision progress scoring and drone-dock operations
            are roadmap capabilities. They are not built and are not running in this demonstration.
            Every observed figure shown here was produced by human reading of imagery.
          </p>
        </section>
      </div>
    </div>
  )
}
