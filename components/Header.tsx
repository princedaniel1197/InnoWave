import Link from 'next/link'

/**
 * Chrome header. The "DEMONSTRATION" tag is permanent and appears on every
 * route — this build is never to be mistaken for a production service.
 */
export default function Header({
  back,
}: {
  back?: { href: string; label: string }
}) {
  return (
    <header className="border-b border-border bg-chrome print-hide">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-8 h-[58px] flex items-center gap-5">
        <Link href="/" className="flex items-baseline gap-2.5 shrink-0 group">
          <span className="font-syne text-[15px] font-bold tracking-tight text-off-white group-hover:text-gold transition-colors">
            VANTIS
          </span>
          <span className="hidden sm:inline w-px h-3.5 bg-border-soft self-center" />
          <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.22em] text-gray">
            Build · Verified Progress
          </span>
        </Link>

        {back && (
          <>
            <span className="w-px h-3.5 bg-border-soft" />
            <Link
              href={back.href}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray hover:text-gold transition-colors truncate"
            >
              ← {back.label}
            </Link>
          </>
        )}

        <div className="flex-1" />

        <span
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-dim border border-border-gold px-2.5 py-1 rounded-sm shrink-0"
          title="This is a demonstration build. No record produced here is issued for reliance."
        >
          Demonstration
        </span>
      </div>
    </header>
  )
}
