'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import type { Project } from '@/lib/types'
import KarnatakaFallback from './KarnatakaFallback'

/* Leaflet touches window on import — it cannot be server-rendered. */
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

/** Tiles get this long to prove themselves before the fallback takes over. */
const TILE_TIMEOUT_MS = 3000

type TileState = 'pending' | 'ok' | 'failed'

function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0B0B12]">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">
        Loading map
      </span>
    </div>
  )
}

export default function PortfolioMap({
  projects,
  selectedId,
  onSelect,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (p: Project) => void
}) {
  const [tiles, setTiles] = useState<TileState>('pending')
  const settled = useRef(false)

  const settle = useCallback((s: TileState) => {
    if (settled.current) return
    settled.current = true
    setTiles(s)
  }, [])

  const onTilesOk = useCallback(() => settle('ok'), [settle])
  const onTilesFailed = useCallback(() => settle('failed'), [settle])

  useEffect(() => {
    const t = setTimeout(() => settle('failed'), TILE_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [settle])

  /* Offline: skip the network entirely and go straight to the outline. */
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) settle('failed')
  }, [settle])

  if (tiles === 'failed') {
    return (
      <div className="relative w-full h-full">
        <KarnatakaFallback projects={projects} selectedId={selectedId} onSelect={onSelect} />
        <div className="absolute bottom-2 left-2 font-mono text-[8px] uppercase tracking-[0.18em] text-dim bg-background/80 border border-border px-2 py-1 rounded-sm">
          Offline map · tile service unreachable
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        projects={projects}
        selectedId={selectedId}
        onSelect={onSelect}
        onTilesOk={onTilesOk}
        onTilesFailed={onTilesFailed}
      />
      {tiles === 'pending' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#0B0B12]/60">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">
            Loading tiles
          </span>
        </div>
      )}
    </div>
  )
}
