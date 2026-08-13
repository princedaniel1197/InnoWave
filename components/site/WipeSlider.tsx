'use client'

import { useEffect, useMemo, useState } from 'react'

import type { Frame, FramesManifest } from '@/lib/types'
import { framePath } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { Label, PlaceholderImageryChip } from '@/components/Chips'

/**
 * Imagery timeline. Two frames from the manifest stacked exactly on top of each
 * other; a range input drives a clip-path wipe between them.
 *
 * All frames are preloaded on mount so scrubbing never hits the network mid-demo.
 */
export default function WipeSlider({
  manifest,
  projectId,
}: {
  manifest: FramesManifest
  projectId: string
}) {
  const frames = manifest.frames
  const [fromIdx, setFromIdx] = useState(0)
  const [toIdx, setToIdx] = useState(frames.length - 1)
  const [wipe, setWipe] = useState(50)

  /* Preload every frame — the slider must never stall on a dropped connection. */
  useEffect(() => {
    const imgs = frames.map(f => {
      const img = new Image()
      img.src = framePath(projectId, f.file)
      return img
    })
    return () => {
      imgs.forEach(i => {
        i.src = ''
      })
    }
  }, [frames, projectId])

  const from = frames[Math.min(fromIdx, frames.length - 1)]
  const to = frames[Math.min(toIdx, frames.length - 1)]
  const anyPlaceholder = useMemo(() => frames.some(f => f.status === 'placeholder'), [frames])

  /* A wipe needs two distinct frames. */
  if (frames.length < 2) {
    return (
      <section className="bg-surface border border-border rounded-sm">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
          <Label>Imagery Timeline</Label>
          {anyPlaceholder && <PlaceholderImageryChip />}
        </div>
        <p className="px-5 py-8 text-sm text-gray-light text-center">
          A comparison needs at least two frames. This series has {frames.length}.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-surface border border-border rounded-sm">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <Label>Imagery Timeline</Label>
        <div className="flex items-center gap-1.5">
          {anyPlaceholder && <PlaceholderImageryChip />}
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
            {frames.length} frames
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Wipe viewport */}
        <div
          className="relative w-full overflow-hidden rounded-sm border border-border bg-[#0B0B12] select-none"
          style={{ aspectRatio: '3 / 2' }}
        >
          {/* Earlier frame — the base layer */}
          <img
            src={framePath(projectId, from.file)}
            alt={`Site imagery captured ${from.date}`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Later frame — revealed from the left as the slider moves right */}
          <img
            src={framePath(projectId, to.file)}
            alt={`Site imagery captured ${to.date}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}
            draggable={false}
          />

          {/* Divider */}
          <div
            className="absolute top-0 bottom-0 w-px bg-gold pointer-events-none"
            style={{ left: `${wipe}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-gold bg-background/85 flex items-center justify-center">
              <span className="font-mono text-[9px] text-gold leading-none">‹›</span>
            </div>
          </div>

          {/* Corner date stamps */}
          <div className="absolute top-2 left-2 bg-background/85 border border-border px-2 py-1 rounded-sm pointer-events-none">
            <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-dim">From</div>
            <div className="font-mono text-[11px] text-off-white tabular">{formatDate(from.date)}</div>
          </div>
          <div className="absolute top-2 right-2 bg-background/85 border border-border px-2 py-1 rounded-sm text-right pointer-events-none">
            <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-dim">To</div>
            <div className="font-mono text-[11px] text-gold tabular">{formatDate(to.date)}</div>
          </div>
        </div>

        {/* Wipe control */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={100}
            value={wipe}
            onChange={e => setWipe(Number(e.target.value))}
            aria-label="Wipe between the earlier and later frame"
            className="w-full accent-[#C9A84C] cursor-ew-resize"
          />
        </div>

        {/* Date scrubber */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* from and to may never be the same frame — wiping a frame against
              itself does nothing and reads as a broken control. */}
          <FrameRow
            legend="Compare from"
            frames={frames}
            active={fromIdx}
            onPick={i => setFromIdx(Math.min(i, toIdx - 1))}
            disabledAfter={toIdx - 1}
          />
          <FrameRow
            legend="Compare to"
            frames={frames}
            active={toIdx}
            onPick={i => setToIdx(Math.max(i, fromIdx + 1))}
            disabledBefore={fromIdx + 1}
          />
        </div>

        <p className="text-[11px] text-dim mt-4 leading-relaxed">
          {manifest.note}
        </p>
      </div>
    </section>
  )
}

function FrameRow({
  legend,
  frames,
  active,
  onPick,
  disabledBefore,
  disabledAfter,
}: {
  legend: string
  frames: Frame[]
  active: number
  onPick: (i: number) => void
  disabledBefore?: number
  disabledAfter?: number
}) {
  return (
    <div>
      <Label className="mb-2">{legend}</Label>
      <div className="flex flex-wrap gap-1">
        {frames.map((f, i) => {
          const disabled =
            (disabledBefore !== undefined && i < disabledBefore) ||
            (disabledAfter !== undefined && i > disabledAfter)
          const on = i === active
          return (
            <button
              key={f.file}
              onClick={() => onPick(i)}
              disabled={disabled}
              title={`${f.date} · ${f.source}${f.status === 'placeholder' ? ' · placeholder' : ''}`}
              className={[
                'font-mono text-[9px] tabular px-2 py-1.5 rounded-sm border transition-colors',
                on
                  ? 'border-gold bg-gold/[0.12] text-gold'
                  : disabled
                    ? 'border-border bg-surface text-dim opacity-40 cursor-not-allowed'
                    : 'border-border bg-surface text-gray-light hover:border-gold/40 hover:text-gold',
              ].join(' ')}
            >
              {f.date.slice(0, 7)}
              {f.status === 'placeholder' && <span className="ml-1 text-[8px] opacity-70">◦</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
