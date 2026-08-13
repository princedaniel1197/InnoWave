'use client'

import type { PhotosManifest } from '@/lib/types'
import { PENDING_DATE } from '@/lib/provenance'
import { photoPath } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { Label, PendingChip } from '@/components/Chips'

/** Ground record strip — the 13 site photographs, captions and dates from the manifest. */
export default function PhotoStrip({
  manifest,
  projectId,
}: {
  manifest: PhotosManifest
  projectId: string
}) {
  const pendingCount = manifest.photos.filter(p => p.date === PENDING_DATE).length

  return (
    <section className="bg-surface border border-border rounded-sm">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <Label>Ground Record</Label>
        <div className="flex items-center gap-1.5">
          {pendingCount > 0 && <PendingChip label={`${pendingCount} dates pending`} />}
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
            {manifest.photos.length} photographs
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {manifest.photos.map((photo, i) => (
            <figure key={photo.file} className="shrink-0 w-[210px]">
              <div className="w-full aspect-[4/3] rounded-sm overflow-hidden border border-border bg-[#0B0B12]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPath(projectId, photo.file)}
                  alt={photo.caption}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="mt-2">
                <div className="text-[11px] text-gray-light leading-snug">{photo.caption}</div>
                <div className="font-mono text-[9px] text-dim mt-1 tracking-wide">
                  {photo.date === PENDING_DATE ? 'date pending verification' : formatDate(photo.date)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="text-[11px] text-dim mt-3 leading-relaxed">{manifest.note}</p>
      </div>
    </section>
  )
}
