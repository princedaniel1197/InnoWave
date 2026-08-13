'use client'

import outlines from '@/data/karnataka-districts.json'
import type { Project } from '@/lib/types'
import { statusHex } from '@/lib/provenance'
import { displayName } from '@/lib/data'

/**
 * Offline map. Used when CARTO tiles fail to load — CLAUDE.md rule 12.
 * The demo must never show a grey broken tile grid.
 *
 * Pin positions are computed from lat/lng by a least-squares fit of the 31
 * district label anchors against their approximate centroids. Mean residual is
 * ~30 units on a 1634x2367 canvas (~2%), which is well inside "approximate".
 */
const FIT = {
  x: (lng: number) => 312.4815 * lng - 23059.25,
  y: (lat: number) => -337.1736 * lat + 6270.1117,
}

export function projectToSvg(lat: number, lng: number) {
  return { x: FIT.x(lng), y: FIT.y(lat) }
}

export default function KarnatakaFallback({
  projects,
  selectedId,
  onSelect,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (p: Project) => void
}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0B0B12] p-4">
      <svg
        viewBox={outlines.viewBox}
        className="w-full h-full"
        role="img"
        aria-label="Map of Karnataka showing monitored project locations"
      >
        <g>
          {outlines.districts.map(d => (
            <path
              key={d.id}
              d={d.d}
              fill="rgba(30,30,46,0.55)"
              stroke="rgba(42,42,62,0.9)"
              strokeWidth={3}
            />
          ))}
        </g>

        {projects.map(p => {
          const { x, y } = projectToSvg(p.location.lat, p.location.lng)
          const sel = selectedId === p.id
          const hex = statusHex(p.status)
          return (
            <g
              key={p.id}
              transform={`translate(${x},${y})`}
              onClick={() => onSelect(p)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={displayName(p)}
            >
              {sel && <circle r={54} fill={hex} opacity={0.14} />}
              <circle r={30} fill={hex} opacity={0.22} />
              <circle r={15} fill={hex} stroke="#0A0A0F" strokeWidth={4} />
              {p.provenance === 'SYNTHETIC' && (
                <>
                  <circle cx={22} cy={-22} r={12} fill="#0A0A0F" stroke={hex} strokeWidth={3} />
                  <text
                    x={22}
                    y={-17}
                    textAnchor="middle"
                    fontSize={15}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={hex}
                  >
                    S
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
