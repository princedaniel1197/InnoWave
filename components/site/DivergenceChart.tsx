'use client'

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Project } from '@/lib/types'
import { TOLERANCE_POINTS, isSynthetic } from '@/lib/provenance'
import { formatDate, formatMonth } from '@/lib/utils'
import { Label, SyntheticChip } from '@/components/Chips'

const GOLD = '#C9A84C'
const IVORY = '#F0EEE8'
const RED = '#EF4444'

interface Row {
  date: string
  declared: number | null
  observed: number | null
  declaredInterp: boolean
  observedInterp: boolean
  declaredSource?: string
  observedBasis?: string
  /** [observed, declared] — shaded band between the two lines. */
  band: [number, number] | null
  beyond: boolean
}

function buildRows(p: Project): Row[] {
  const dates = Array.from(
    new Set([...p.declared_series, ...p.observed_series].map(x => x.date))
  )
    .filter(d => d !== 'FILL_FROM_KRERA_PORTAL')
    .sort()

  return dates.map(date => {
    const d = p.declared_series.find(x => x.date === date)
    const o = p.observed_series.find(x => x.date === date)
    const dp = d && d.pct >= 0 ? d.pct : null
    const op = o && o.pct >= 0 ? o.pct : null
    const gap = dp !== null && op !== null ? dp - op : null

    return {
      date,
      declared: dp,
      observed: op,
      declaredInterp: d?.interpolated ?? false,
      observedInterp: o?.interpolated ?? false,
      declaredSource: d?.source,
      observedBasis: o?.basis,
      band: dp !== null && op !== null ? [Math.min(dp, op), Math.max(dp, op)] : null,
      beyond: !isSynthetic(p) ? false : gap !== null && gap > TOLERANCE_POINTS,
    }
  })
}

/** Hollow ring for interpolated points, filled dot for backed points. */
function makeDot(colour: string, interpKey: 'declaredInterp' | 'observedInterp') {
  const Dot = (props: { cx?: number; cy?: number; payload?: Row; index?: number }) => {
    const { cx, cy, payload } = props
    if (cx === undefined || cy === undefined || !payload) return <g />
    const interp = payload[interpKey]
    return (
      <circle
        cx={cx}
        cy={cy}
        r={interp ? 4.5 : 3.5}
        fill={interp ? '#0F0F18' : colour}
        stroke={colour}
        strokeWidth={interp ? 1.5 : 1}
        strokeDasharray={interp ? '2 1.6' : undefined}
      />
    )
  }
  Dot.displayName = `Dot(${interpKey})`
  return Dot
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: Row }[]
}) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  const gap = r.declared !== null && r.observed !== null ? r.declared - r.observed : null

  return (
    <div className="bg-surface2 border border-border-soft rounded-sm px-3 py-2.5 max-w-[300px]">
      <div className="font-mono text-[10px] text-off-white tabular mb-2">{formatDate(r.date)}</div>

      {r.declared !== null && (
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-[2px]" style={{ background: GOLD }} />
            <span className="font-mono text-[10px] text-gray-light">Declared</span>
            <span className="font-mono text-[11px] tabular ml-auto" style={{ color: GOLD }}>
              {r.declared}%
            </span>
          </div>
          {r.declaredSource && (
            <div className="text-[10px] text-dim leading-snug mt-0.5 pl-4">
              {r.declaredSource}
              {r.declaredInterp && ' · interpolated'}
            </div>
          )}
        </div>
      )}

      {r.observed !== null && (
        <div className="mb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-[2px]" style={{ background: IVORY }} />
            <span className="font-mono text-[10px] text-gray-light">Observed</span>
            <span className="font-mono text-[11px] tabular ml-auto text-off-white">
              {r.observed}%
            </span>
          </div>
          {r.observedBasis && (
            <div className="text-[10px] text-dim leading-snug mt-0.5 pl-4">
              {r.observedBasis}
              {r.observedInterp && ' · interpolated'}
            </div>
          )}
        </div>
      )}

      {gap !== null && (
        <div className="border-t border-border mt-2 pt-1.5 flex items-center gap-2">
          <span className="font-mono text-[10px] text-gray-light">Gap</span>
          <span
            className="font-mono text-[11px] tabular ml-auto"
            style={{ color: r.beyond ? RED : '#9090AA' }}
          >
            {Math.abs(gap)} pt
          </span>
        </div>
      )}
    </div>
  )
}

export default function DivergenceChart({ p }: { p: Project }) {
  const rows = buildRows(p)
  const synth = isSynthetic(p)
  const anyBeyond = rows.some(r => r.beyond)
  const anyInterp = rows.some(r => r.declaredInterp || r.observedInterp)

  if (rows.length === 0) {
    return (
      <section className="bg-surface border border-border rounded-sm">
        <div className="px-5 py-3 border-b border-border">
          <Label>Declared vs Observed</Label>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-gray-light">
            No progress series to plot. Declared and observed figures are awaiting source data.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-surface border border-border rounded-sm">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <Label>Declared vs Observed Progress</Label>
        {synth && <SyntheticChip />}
      </div>

      <div className="p-5">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
              <defs>
                <linearGradient id="bandAgree" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="bandGap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.26} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0.06} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1E1E2E" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatMonth}
                tick={{ fill: '#6B6B88', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#1E1E2E"
                tickLine={false}
                minTickGap={18}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fill: '#6B6B88', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#1E1E2E"
                tickLine={false}
                width={52}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: '#2A2A3E', strokeWidth: 1 }}
              />

              {/* Shaded gap between the two lines */}
              <Area
                dataKey="band"
                stroke="none"
                fill={anyBeyond ? 'url(#bandGap)' : 'url(#bandAgree)'}
                isAnimationActive={false}
                connectNulls
                activeDot={false}
              />

              <Line
                type="linear"
                dataKey="declared"
                name="Declared"
                stroke={GOLD}
                strokeWidth={2}
                dot={makeDot(GOLD, 'declaredInterp')}
                activeDot={{ r: 5, fill: GOLD, stroke: '#0A0A0F', strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="observed"
                name="Observed"
                stroke={IVORY}
                strokeWidth={2}
                dot={makeDot(IVORY, 'observedInterp')}
                activeDot={{ r: 5, fill: IVORY, stroke: '#0A0A0F', strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + honesty notes */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-6 gap-y-2.5">
          <span className="flex items-center gap-2">
            <span className="w-4 h-[2px]" style={{ background: GOLD }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
              Declared by promoter
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-[2px]" style={{ background: IVORY }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
              Observed by Vantis
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-4 h-2.5 rounded-[1px]"
              style={{ background: anyBeyond ? 'rgba(239,68,68,0.22)' : 'rgba(201,168,76,0.14)' }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
              {anyBeyond ? `Gap beyond ${TOLERANCE_POINTS} pt` : `Agreement within ${TOLERANCE_POINTS} pt`}
            </span>
          </span>
          {anyInterp && (
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-gray-light" />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-light">
                Interpolated — not backed by a filing or an image
              </span>
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
