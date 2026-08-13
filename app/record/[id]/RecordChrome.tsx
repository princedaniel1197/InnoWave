'use client'

import Link from 'next/link'

/** Chrome around the paper. None of this prints — see .print-hide in globals.css. */
export default function RecordChrome({ projectId }: { projectId: string }) {
  return (
    <div className="print-hide flex flex-wrap items-center gap-2.5 mb-5">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-gold text-background font-mono text-[11px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-sm hover:bg-gold-light transition-colors"
      >
        Print record
      </button>
      <Link
        href={`/site/${projectId}`}
        className="inline-flex items-center gap-2 border border-border text-gray-light font-mono text-[11px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-sm hover:border-gold/40 hover:text-gold transition-colors"
      >
        ← Back to site
      </Link>
    </div>
  )
}
