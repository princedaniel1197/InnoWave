'use client'

import type { Project } from '@/lib/types'
import { readDivergence } from '@/lib/provenance'
import { formatDate, formatDateLong } from '@/lib/utils'
import { Label } from '@/components/Chips'

/**
 * The evidence position for a project with a single certified observation.
 *
 * A two-line divergence chart would imply a trajectory that no filing supports.
 * This renders exactly what is on file — the registration point and one
 * certified point — against a deliberately empty axis, and says so.
 *
 * The emptiness is the argument, not a defect.
 */

const GOLD = '#C9A84C'
const IVORY = '#F0EEE8'

/* Chart geometry, in SVG user units. */
const W = 900
const H = 300
const PAD = { top: 18, right: 128, bottom: 40, left: 46 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

export default function CertifiedPoint({ p }: { p: Project }) {
  const declared = p.declared_series.filter(d => d.pct >= 0)
  const observed = p.observed_series.filter(o => o.pct >= 0)
  const div = readDivergence(p)

  const certified = declared[declared.length - 1]
  const origin = declared[0]
  const obs = observed[observed.length - 1]

  if (!certified || !origin) return null

  const t0 = new Date(origin.date).getTime()
  const t1 = new Date(certified.date).getTime()
  const span = Math.max(t1 - t0, 1)

  const x = (date: string) =>
    PAD.left + ((new Date(date).getTime() - t0) / span) * PLOT_W
  const y = (pct: number) => PAD.top + (1 - pct / 100) * PLOT_H

  const cx = x(certified.date)
  const cy = y(certified.pct)
  const oy = obs ? y(obs.pct) : null

  return (
    <section className="bg-surface border border-border rounded-sm">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <Label>Evidence Position</Label>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
          {declared.length} declared · {observed.length} observed
        </span>
      </div>

      <div className="p-5">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[560px]"
            role="img"
            aria-label={`Declared ${certified.pct}% and observed ${obs?.pct ?? '—'}% at ${certified.date}. No other certified data points on file.`}
          >
            {/* Horizontal gridlines */}
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="#1E1E2E"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 10}
                  y={y(v) + 3.5}
                  textAnchor="end"
                  fontSize={10}
                  fontFamily="monospace"
                  fill="#6B6B88"
                >
                  {v}%
                </text>
              </g>
            ))}

            {/* Baseline */}
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(0)}
              y2={y(0)}
              stroke="#2A2A3E"
              strokeWidth={1}
            />

            {/* The empty interval — named rather than left to look broken */}
            <rect
              x={PAD.left}
              y={PAD.top}
              width={cx - PAD.left}
              height={PLOT_H}
              fill="rgba(107,107,136,0.035)"
            />
            <text
              x={PAD.left + (cx - PAD.left) / 2}
              y={PAD.top + PLOT_H / 2 - 6}
              textAnchor="middle"
              fontSize={11}
              fontFamily="monospace"
              fill="#54546B"
              letterSpacing="1.6"
            >
              NO CERTIFIED OBSERVATION ON FILE
            </text>
            <text
              x={PAD.left + (cx - PAD.left) / 2}
              y={PAD.top + PLOT_H / 2 + 12}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill="#54546B"
            >
              {monthsBetween(origin.date, certified.date)} months
            </text>

            {/* Registration point */}
            <circle cx={x(origin.date)} cy={y(origin.pct)} r={4} fill="#6B6B88" />
            <text
              x={x(origin.date)}
              y={y(origin.pct) + 20}
              textAnchor="start"
              fontSize={10}
              fontFamily="monospace"
              fill="#6B6B88"
            >
              {origin.pct}% · registration
            </text>

            {/* The gap between declared and observed */}
            {oy !== null && (
              <line
                x1={cx}
                x2={cx}
                y1={cy}
                y2={oy}
                stroke={GOLD}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.6}
              />
            )}

            {/* Declared marker */}
            <circle cx={cx} cy={cy} r={6} fill={GOLD} stroke="#0A0A0F" strokeWidth={2} />
            <text
              x={cx + 14}
              y={cy - 4}
              fontSize={16}
              fontFamily="monospace"
              fontWeight="bold"
              fill={GOLD}
            >
              {certified.pct}%
            </text>
            <text x={cx + 14} y={cy + 9} fontSize={9} fontFamily="monospace" fill="#9090AA">
              DECLARED
            </text>

            {/* Observed marker */}
            {obs && oy !== null && (
              <>
                <circle cx={cx} cy={oy} r={6} fill={IVORY} stroke="#0A0A0F" strokeWidth={2} />
                <text
                  x={cx + 14}
                  y={oy + 5}
                  fontSize={16}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={IVORY}
                >
                  {obs.pct}%
                </text>
                <text x={cx + 14} y={oy + 18} fontSize={9} fontFamily="monospace" fill="#9090AA">
                  OBSERVED
                </text>
              </>
            )}

            {/* Axis dates */}
            <text
              x={PAD.left}
              y={H - 16}
              textAnchor="start"
              fontSize={10}
              fontFamily="monospace"
              fill="#6B6B88"
            >
              {formatDate(origin.date)}
            </text>
            <text
              x={cx}
              y={H - 16}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill={GOLD}
            >
              {formatDate(certified.date)}
            </text>
          </svg>
        </div>

        {/* Citations */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: GOLD }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
                Declared {certified.pct}% · {formatDateLong(certified.date)}
              </span>
            </div>
            <p className="text-[11px] text-dim leading-relaxed">{certified.source}</p>
          </div>

          {obs && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: IVORY }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
                  Observed {obs.pct}% · {formatDateLong(obs.date)}
                </span>
              </div>
              <p className="text-[11px] text-dim leading-relaxed">{obs.basis}</p>
            </div>
          )}
        </div>

        {div.points !== null && (
          <div className="mt-4 pt-4 border-t border-border flex items-baseline gap-2.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray">Gap</span>
            <span className="font-mono text-lg text-gray-light tabular">
              {Math.abs(div.points)} pt
            </span>
            <span className="text-[11px] text-dim leading-relaxed">
              declared {div.declaredPct}% against observed {div.observedPct}%
            </span>
          </div>
        )}

        <p className="text-[11px] text-dim mt-4 leading-relaxed border-l-2 border-border-soft pl-3">
          Single certified data point on file. Earlier quarterly filings not yet retrieved. The
          axis is empty because nothing else has been certified — not because data is missing from
          this record.
        </p>
      </div>
    </section>
  )
}

function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.max(
    0,
    Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  )
}
