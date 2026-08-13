import type { Project } from '@/lib/types'
import { PENDING_DATE, isSynthetic, readDivergence } from '@/lib/provenance'
import { displayName, displayPromoter, displayRera, getFrames, getPhotos } from '@/lib/data'
import { formatDateLong } from '@/lib/utils'

/**
 * The Verified Progress Record. Ivory A4 paper, descended from the Vantis
 * certificate treatment. Prints to one clean page — see the @media print
 * block in app/globals.css.
 *
 * Every fault-implying line on this document is gated on provenance.
 */

const RECORD_DATE = '2026-08-13'

function Rule() {
  return <div className="vpr-rule h-px bg-[color:var(--paper-line)] my-4" />
}

function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 mb-2">
      <span className="font-mono text-[8px] text-[color:var(--paper-muted)] tabular">{n}</span>
      <h2 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--paper-muted)]">
        {children}
      </h2>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
        {label}
      </div>
      <div className="text-[11px] text-[color:var(--paper-ink)] leading-snug mt-0.5 break-words">
        {value}
      </div>
    </div>
  )
}

export default function VPRDocument({ p }: { p: Project }) {
  const synth = isSynthetic(p)
  const div = readDivergence(p)
  const frames = getFrames(p.id)
  const photos = getPhotos(p.id)
  const pending = p.rera_no === 'FILL_FROM_KRERA_PORTAL'

  const latestDeclared = p.declared_series.filter(d => d.pct >= 0).slice(-1)[0]
  const latestObserved = p.observed_series.filter(o => o.pct >= 0).slice(-1)[0]

  const watermark = synth ? 'SPECIMEN — SYNTHETIC SCENARIO' : 'SPECIMEN'

  return (
    <div
      className="vpr-paper relative mx-auto bg-paper text-[color:var(--paper-ink)] overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '820px',
        aspectRatio: '1 / 1.414',
        minHeight: '1000px',
        padding: '44px 52px',
      }}
    >
      {/* Diagonal SPECIMEN watermark */}
      <div
        className="vpr-watermark absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-syne font-bold whitespace-nowrap"
          style={{
            transform: 'rotate(-32deg)',
            fontSize: synth ? '3.1rem' : '5.5rem',
            color: 'var(--paper-ink)',
            opacity: 0.055,
            letterSpacing: '0.06em',
          }}
        >
          {watermark}
        </span>
      </div>

      <div className="relative">
        {/* 1 — Header */}
        <header className="vpr-block flex items-start justify-between gap-6 pb-4 border-b-2 border-[color:var(--paper-ink)]">
          <div>
            <div className="font-syne text-[15px] font-bold tracking-tight leading-none">VANTIS</div>
            <div className="font-mono text-[7px] uppercase tracking-[0.22em] text-[color:var(--paper-muted)] mt-1">
              Orianode Technologies
            </div>
          </div>
          <div className="text-right">
            <h1 className="font-display text-[26px] leading-none">Verified Progress Record</h1>
            <div className="font-mono text-[10px] tabular mt-1.5">{p.record_no}</div>
          </div>
        </header>

        {synth && (
          <div className="vpr-syn-banner vpr-block mt-3 border border-[#B07A12] bg-[#F5E9CC] px-3 py-2">
            <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#8A5D0A]">
              Synthetic — illustrative
            </div>
            <div className="text-[10px] leading-snug text-[#5C4408] mt-0.5">
              This record describes a fictional scenario. No real developer, project or filing is
              depicted.
            </div>
          </div>
        )}

        {/* 2 — Project block */}
        <section className="vpr-block mt-5">
          <SectionTitle n="1">Project</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Project" value={displayName(p)} />
            <Field label="Promoter" value={displayPromoter(p)} />
            <Field label="RERA registration" value={displayRera(p)} />
            <Field label="Location" value={p.location.label + (p.location.approx ? ' (approximate)' : '')} />
            <Field label="Record date" value={formatDateLong(RECORD_DATE)} />
            <Field
              label="Observation date"
              value={latestObserved ? formatDateLong(latestObserved.date) : 'Not yet observed'}
            />
          </div>
        </section>

        <Rule />

        {/* 3 — Observed state */}
        <section className="vpr-block">
          <SectionTitle n="2">
            Observed state
            {latestObserved ? ` as of ${formatDateLong(latestObserved.date)}` : ''}
          </SectionTitle>
          {p.observed_state?.length ? (
            <ul className="space-y-1">
              {p.observed_state.map((line, i) => (
                <li key={i} className="text-[11px] leading-relaxed flex gap-2">
                  <span className="text-[color:var(--paper-muted)] shrink-0">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] leading-relaxed text-[color:var(--paper-muted)]">
              No independent observation has been carried out for this site. Source data is pending.
            </p>
          )}
          {latestObserved && (
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
                Observed progress
              </span>
              <span className="font-mono text-[15px] tabular font-medium">{latestObserved.pct}%</span>
              <span className="text-[9.5px] text-[color:var(--paper-muted)] leading-snug">
                {latestObserved.basis}
              </span>
            </div>
          )}
        </section>

        <Rule />

        {/* 4 — Declared state */}
        <section className="vpr-block">
          <SectionTitle n="3">Declared state per filing</SectionTitle>
          {latestDeclared ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
                  Declared progress
                </span>
                <span className="font-mono text-[15px] tabular font-medium">{latestDeclared.pct}%</span>
              </div>
              <div className="text-[10px] text-[color:var(--paper-muted)] leading-snug mt-1">
                Source: {latestDeclared.source}
                {latestDeclared.interpolated && ' — interpolated, not backed by a filing'}
              </div>
            </>
          ) : (
            <p className="text-[11px] leading-relaxed text-[color:var(--paper-muted)]">
              The promoter&apos;s declared figure has not been retrieved from the K-RERA portal.
              No figure has been estimated in its place.
            </p>
          )}
        </section>

        <Rule />

        {/* 5 — Divergence */}
        <section className="vpr-block">
          <SectionTitle n="4">Reconciliation</SectionTitle>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: div.beyondTolerance ? '#8C1D18' : 'var(--paper-ink)' }}
          >
            {div.sentence}
          </p>
        </section>

        <Rule />

        {/* 6 — Capture provenance */}
        <section className="vpr-block">
          <SectionTitle n="5">Capture provenance</SectionTitle>
          {p.capture_provenance?.length ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[color:var(--paper-line)]">
                  {['Source', 'Operator', 'Capture dates', 'Frames'].map(h => (
                    <th
                      key={h}
                      className="text-left font-mono text-[7px] uppercase tracking-[0.16em] text-[color:var(--paper-muted)] pb-1.5 font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.capture_provenance.map((c, i) => (
                  <tr key={i} className="border-b border-[color:var(--paper-line)] align-top">
                    <td className="text-[9.5px] py-1.5 pr-3 leading-snug">{c.source_type}</td>
                    <td className="text-[9.5px] py-1.5 pr-3 leading-snug text-[color:var(--paper-muted)]">
                      {c.operator}
                    </td>
                    <td className="text-[9.5px] py-1.5 pr-3 leading-snug tabular">{c.capture_dates}</td>
                    <td className="text-[9.5px] py-1.5 leading-snug text-[color:var(--paper-muted)]">
                      {c.frame_refs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[11px] leading-relaxed text-[color:var(--paper-muted)]">
              No capture has been carried out for this site.
            </p>
          )}

          {(frames?.frames.some(f => f.status === 'placeholder') ||
            photos?.photos.some(ph => ph.date === PENDING_DATE)) && (
            <p className="text-[9px] text-[color:var(--paper-muted)] leading-snug mt-2 italic">
              Note: imagery referenced above is placeholder pending export, and ground-photograph
              capture dates are pending verification. This record is not evidentially complete.
            </p>
          )}
        </section>

        <Rule />

        {/* 7 — Scope & limitations */}
        <section className="vpr-block">
          <SectionTitle n="6">Scope &amp; limitations</SectionTitle>
          <ul className="space-y-1">
            {[
              'Interior and finishing works are not observed by this method.',
              'Satellite baseline resolves footprint and structural change only; it does not resolve materials, workmanship or services.',
              'This record reflects physical observation as at the dates stated. It is not a certification of quality, of statutory compliance, or of title.',
              'Observed progress is expressed as a proportion of the declared scope of work and carries an observation tolerance of ±8 percentage points.',
            ].map((line, i) => (
              <li key={i} className="text-[9.5px] leading-relaxed flex gap-2 text-[color:var(--paper-muted)]">
                <span className="shrink-0">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 8 — Issue block */}
        <section className="vpr-block mt-5 pt-3 border-t-2 border-[color:var(--paper-ink)] flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
              Issued by
            </div>
            <div className="text-[11px] font-medium mt-0.5">Vantis · Orianode Technologies</div>
            <div className="text-[9.5px] text-[color:var(--paper-muted)] mt-0.5">
              {formatDateLong(RECORD_DATE)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[7.5px] uppercase tracking-[0.18em] text-[color:var(--paper-muted)]">
              Record number
            </div>
            <div className="font-mono text-[11px] tabular mt-0.5">{p.record_no}</div>
            {pending && (
              <div className="font-mono text-[7.5px] uppercase tracking-[0.16em] text-[color:var(--paper-muted)] mt-1">
                Provisional — source data pending
              </div>
            )}
          </div>
        </section>

        {/* 9 — Footer disclaimer */}
        <footer className="vpr-block mt-3 text-center">
          <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[color:var(--paper-muted)]">
            Demonstration document. Not issued for reliance.
          </div>
        </footer>
      </div>
    </div>
  )
}
