'use client'

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { Project } from '@/lib/types'
import { statusHex } from '@/lib/provenance'
import { displayName } from '@/lib/data'

/**
 * CARTO dark tiles are the ONE permitted runtime external call (CLAUDE.md
 * rule 3). Failure is reported upward so the caller can swap in the bundled
 * SVG outline — rule 12.
 *
 * Markers are styled divIcons, never Leaflet's default marker images, which
 * 404 under Next's asset pipeline.
 */

const KARNATAKA_CENTRE: [number, number] = [14.6, 76.2]
const KARNATAKA_BOUNDS: [[number, number], [number, number]] = [
  [11.3, 73.8],
  [18.6, 78.7],
]

function pinIcon(p: Project, selected: boolean): L.DivIcon {
  const hex = statusHex(p.status)
  const size = selected ? 40 : 32
  const badge =
    p.provenance === 'SYNTHETIC'
      ? `<span style="position:absolute;top:-4px;right:-5px;width:14px;height:14px;border-radius:50%;
           background:#0A0A0F;border:1.5px solid ${hex};color:${hex};font:bold 9px/11px monospace;
           text-align:center;">S</span>`
      : ''

  return L.divIcon({
    className: 'vantis-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <span style="position:absolute;inset:0;border-radius:50%;background:${hex};opacity:.2;"></span>
        <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:${selected ? 16 : 13}px;height:${selected ? 16 : 13}px;border-radius:50%;
          background:${hex};border:2.5px solid #0A0A0F;
          box-shadow:0 0 0 1px ${hex}55;"></span>
        ${badge}
      </div>`,
  })
}

/** Reports the first successful tile load, or failure, to the caller. */
function TileWatcher({
  onOk,
  onFail,
}: {
  onOk: () => void
  onFail: () => void
}) {
  const map = useMap()
  const errors = useRef(0)

  useEffect(() => {
    // Leaflet needs a nudge when it mounts inside a flex/grid parent.
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(t)
  }, [map])

  useEffect(() => {
    const ok = () => onOk()
    const err = () => {
      errors.current += 1
      if (errors.current >= 3) onFail()
    }
    map.on('tileload', ok)
    map.on('tileerror', err)
    return () => {
      map.off('tileload', ok)
      map.off('tileerror', err)
    }
  }, [map, onOk, onFail])

  return null
}

export default function LeafletMap({
  projects,
  selectedId,
  onSelect,
  onTilesOk,
  onTilesFailed,
}: {
  projects: Project[]
  selectedId: string | null
  onSelect: (p: Project) => void
  onTilesOk: () => void
  onTilesFailed: () => void
}) {
  const icons = useMemo(
    () => new Map(projects.map(p => [p.id, pinIcon(p, p.id === selectedId)])),
    [projects, selectedId]
  )

  return (
    <MapContainer
      center={KARNATAKA_CENTRE}
      zoom={7}
      minZoom={6}
      maxZoom={11}
      maxBounds={KARNATAKA_BOUNDS}
      maxBoundsViscosity={0.7}
      scrollWheelZoom={false}
      zoomControl
      attributionControl
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
        subdomains="abcd"
      />
      <TileWatcher onOk={onTilesOk} onFail={onTilesFailed} />

      {projects.map(p => {
        const icon = icons.get(p.id)
        if (!icon) return null
        return (
          <Marker
            key={p.id}
            position={[p.location.lat, p.location.lng]}
            icon={icon}
            alt={displayName(p)}
            eventHandlers={{ click: () => onSelect(p) }}
          />
        )
      })}
    </MapContainer>
  )
}
