# vantis-build

Standalone demo web app for the Verified Progress Record (VPR) — an independently produced,
evidence-backed record of what has physically been built on a construction site as of a date,
designed to be relied on by a lender, an escrow bank, or a regulator who was never on site.

This URL goes into a competition submission and will be clicked by a screening committee and
explored by strangers. It is presented live to a panel of industry judges and law faculty.
Nothing on any route may embarrass us if explored.

---

## Non-negotiable rules for every session in this repo

1. `vantis/` is READ-ONLY. You may read any file in it. You may never modify, create, delete, or move anything inside it.
2. `vantis-build/` must stand completely alone. Copy files into it; never import across folders. When finished, `vantis-build/` must build and run with `vantis/` deleted from disk.
3. No database. No auth. No API routes. No env vars. No external data fetching at runtime. All content comes from static JSON and static images inside the repo. The only permitted runtime-external dependency is the map tile layer, and it must degrade gracefully (rule 12).
4. Data provenance is law. Every project entity in the data layer carries a `provenance` field: `"REAL"` or `"SYNTHETIC"`. These rules are absolute:
   * A `REAL` entity may never carry an amber/red status, a divergence flag, a risk score, or any fault-implying claim. Real entities render green/neutral only.
   * Every `SYNTHETIC` entity renders with a visible "SYNTHETIC — ILLUSTRATIVE" chip everywhere it appears, including inside charts and inside the VPR document.
   * Any capability that is roadmap rather than built (computer-vision analysis, automated change detection, drone-dock operations) is labelled "ROADMAP" in the UI wherever referenced. Never present it as live.
   * Any chart data point not backed by an actual filing or an actual image is styled and labelled "interpolated" or "estimated — pending annotation".
5. One real project is the exception to anonymity: Divya Villas (promoter JDA Projects, RERA No. PRM/KA/RERA/1268/378/PR/180924/007034). It is the founder's family project, used with permission, and it is the HONEST case — declared and observed progress agree. It stays fully named. It is green. It never carries a fault claim.
6. Do not copy from `vantis/`: the chatbot, the 8,771-project registry, or any seed data that pairs a real developer/project name with a risk score, default flag, or notice. If a copied file contains such records, strip or anonymise them during the copy.
7. Commit after every step with clear messages. Small commits.
8. This prompt contains exactly one hard STOP (end of Step 1). Summarise your recon and wait for my go-ahead there. After I approve, run everything from Step 2 to Step 4 straight through without pausing — I will be away and unable to answer. Do not ask questions mid-run. Where something is ambiguous, choose the option that is more conservative about data honesty and simpler to change later, proceed, and record every such decision in a `DECISIONS.md` file at the repo root with the reasoning. Never invent data for a `REAL` entity in order to keep moving — leave the placeholder and note it.

---

## Additional standing rules for this repo

9. **The honesty sweep is a release gate.** Before any commit that touches a route: every synthetic
   entity chipped everywhere it renders; every roadmap capability labelled; every interpolated point
   styled and labelled; no real name within a screen-width of a fault claim; placeholder imagery chipped.
10. **Never fill a `FILL_FROM_KRERA_PORTAL` or `PENDING_VERIFICATION` placeholder with invented data.**
    These are founder-input slots. Leave them; they render as an explicit "data pending" chip.
11. **`REAL` status values are restricted to `verified` and `monitored`.** `watch` and `divergence`
    are reachable only by `SYNTHETIC` entities. This is enforced in `lib/provenance.ts` — do not weaken it.
12. **The map must never show a grey broken tile grid.** CARTO tiles are the single permitted runtime
    external call; if they do not load within 3s, the bundled SVG Karnataka outline takes over.

## Architecture

- Next.js 14 App Router, TypeScript strict, Tailwind 3.
- Routes: `/`, `/site/[id]`, `/record/[id]`. Nothing else.
- All data: `data/*.json`. All imagery: `public/`. No runtime fetching.
- Design tokens: CSS variables in `app/globals.css`, surfaced to Tailwind in `tailwind.config.ts`.
- See `DESIGN_SYSTEM.md` for type scale, spacing, and component idiom.
- See `DECISIONS.md` for every ambiguous call made during the build and its reasoning.
