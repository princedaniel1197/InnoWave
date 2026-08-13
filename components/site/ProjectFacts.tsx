import type { Project } from '@/lib/types'
import { Label } from '@/components/Chips'

/**
 * Registry and financial detail, as filed.
 *
 * Figures render exactly as they appear in the source documents. Nothing here
 * is parsed, summed, differenced or compared — this panel states the record and
 * makes no finding on it. See DECISIONS.md on why no arithmetic is performed on
 * a REAL entity's filed figures.
 */

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-5 py-3 bg-surface">
      <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-gray">{label}</div>
      <div
        className={`mt-1 leading-snug break-words ${
          mono ? 'font-mono text-[12px] tabular text-off-white' : 'text-[12px] text-gray-light'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export default function ProjectFacts({ p }: { p: Project }) {
  const f = p.finance
  const acct = p.designated_account

  const hasRegistry =
    p.promoter_pan || p.registered_office || p.survey_numbers || p.district || p.encumbrance_period

  if (!hasRegistry && !f && !acct) return null

  return (
    <section className="border border-border rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-2">
        <Label>Registry &amp; Filings — as recorded</Label>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
          K-RERA · Forms Ex3–Ex7
        </span>
      </div>

      {hasRegistry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {p.promoter_pan && <Row label="Promoter PAN" value={p.promoter_pan} mono />}
          {p.survey_numbers && <Row label="Survey numbers" value={p.survey_numbers} mono />}
          {p.district && <Row label="District" value={p.district} />}
          {p.encumbrance_period && <Row label="Encumbrance certificate" value={p.encumbrance_period} />}
          {p.registered_office && (
            <div className="sm:col-span-2">
              <Row label="Registered office" value={p.registered_office} />
            </div>
          )}
        </div>
      )}

      {f && (
        <>
          <div className="px-5 py-2.5 bg-background border-y border-border">
            <Label>Project finance — as filed</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            <Row label="Project cost (₹)" value={f.project_cost} mono />
            <Row label="Funds utilised to date (₹)" value={f.funds_utilised_to_date} mono />
            <Row label="Promoter's own funds (₹)" value={f.promoter_own_funds} mono />
            <Row label="Total borrowings (₹)" value={f.total_borrowings} mono />
            <div className="sm:col-span-2">
              <Row label="Lender" value={f.lender} />
            </div>
            <div className="sm:col-span-2">
              <Row label="Collections from allottees (₹)" value={f.allottee_collections} mono />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-surface border-t border-border">
            <p className="text-[10px] text-dim leading-relaxed">
              Source: {f.source}. Figures are reproduced as filed. This record states them and
              makes no finding on fund utilisation or escrow compliance.
            </p>
          </div>
        </>
      )}

      {acct && (
        <>
          <div className="px-5 py-2.5 bg-background border-y border-border">
            <Label>Designated account</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            <Row label="Bank" value={acct.bank} />
            <Row label="IFSC" value={acct.ifsc} mono />
          </div>
        </>
      )}

      {p.delay_cause && (
        <>
          <div className="px-5 py-2.5 bg-background border-y border-border">
            <Label>Extension — stated cause</Label>
          </div>
          <div className="px-5 py-3 bg-surface">
            <p className="text-[12px] text-gray-light leading-relaxed">{p.delay_cause}</p>
          </div>
        </>
      )}
    </section>
  )
}
