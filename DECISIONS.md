# DECISIONS

Every ambiguous call taken during the build, and why. Per CLAUDE.md rule 8, the
tiebreaker in each case was: **whichever option is more conservative about data
honesty, and simpler to change later.**

Ordered roughly by how much you may want to overrule me.

---

## 1. The three "real Bengaluru projects" are unnamed

**Ambiguity.** Step 2c asked for three real Bengaluru projects carrying a `name`, with
`FILL_FROM_KRERA_PORTAL` wherever data is pending. But rule 5 says Divya Villas is *"the
exception to anonymity"* — which implies every other real entity is anonymous — and rule 6
requires anonymising real names carried over from `vantis/`.

**Decision.** The three entries are `provenance: REAL`, `status: monitored`, with **`name`
itself treated as a founder-input slot** (`FILL_FROM_KRERA_PORTAL`). They render as
"Monitored Project A/B/C · Bengaluru" with a DATA PENDING chip, via the
`display_placeholder` field.

**Why.** Naming a real developer's project on a public competition URL is a permission
question, and permission exists only for Divya Villas. Inventing three plausible names
would breach rule 8. Step 2c itself says these render "with a 'data pending' chip until
filled", so a pending name is consistent with the intent.

**To overrule:** set `name` and `promoter` in `data/projects.json`. The chip disappears
automatically. Their real locality coordinates (Whitefield, Hebbal, Sarjapur Road) are
already in place, marked `approx: true`.

---

## 2. Divya Villas' RERA number — three conflicting versions existed

**Ambiguity.** `vantis/` contains three different identities for Divya Villas.

| Source | RERA No. | Survey Nos. |
|---|---|---|
| Your prompt | `PRM/KA/RERA/1268/378/PR/180924/007034` | — |
| Real PDF filename on disk | `PRMKARERA1268378PR180924007034` | EC PDFs cite 83/2, 84/2 |
| `vantis/data/certificates.json` | `…1268378/PR/…` (a slash missing) | 83/2, 84/2 |
| `vantis/data/verify-projects.json` | `PRM/KA/RERA/1251/446/PR/171108/002019` | 88/4, 89/2 |

**Decision.** Used your prompt's number. The `verify-projects.json` record was not copied.

**Why.** The actual RERA certificate PDF filename in `vantis/public/documents/divya-villas/`
corroborates your number exactly. The `verify-projects.json` record is fabricated demo data
(it also carries an invented `trust_score: 96` and "Ready to Move") and pairs a real name
with scored data, which rule 6 forbids.

---

## 3. `vantis/data/qpr.json` percentages were NOT imported

**Ambiguity.** That file holds a Divya Villas quarterly series (Q4'24 35% → Q1'26 96%)
presented as filed QPR data. It would have populated `declared_series` nicely.

**Decision.** Not imported. `declared_series` uses only your three points, with the
mid-series 78% left flagged `interpolated: true` and sourced
`"PENDING — founder to fill from QPR"`.

**Why.** I could find no filing backing those percentages, and Divya Villas is a REAL
entity — rule 8 forbids inventing data for one. The figures are in the founder checklist
in `README.md` as a candidate source for you to confirm or discard.

---

## 4. Synthetic projects carry no RERA-shaped number

**Ambiguity.** Every project needs a `rera_no`, and the record number pattern is derived
from it ("last 6 digits of the RERA no + sequence").

**Decision.** Synthetic entities carry the literal string
`"NOT REGISTERED — SYNTHETIC SCENARIO"`, and their record numbers use a `SYN` token —
`VPR-2026-SYN014-0005`, `VPR-2026-SYN027-0006`.

**Why.** A well-formed fake RERA number printed on a document that looks like a real
instrument is exactly the thing a law-faculty judge would object to. A reader could check
it against the K-RERA portal and find nothing, or worse, find someone else's project.

---

## 5. A REAL entity beyond tolerance fails the build

**Ambiguity.** Rule 4 says a REAL entity may never carry a divergence flag. What should
happen if someone later edits `projects.json` so a real project's declared and observed
figures disagree by more than the tolerance?

**Decision.** `assertProvenanceInvariants()` in `lib/provenance.ts` **throws**, failing the
build. `readDivergence()` additionally refuses to emit `beyondTolerance: true` for a REAL
entity regardless of the numbers.

**Why.** Silently rendering it green would be a lie; silently rendering it red would breach
rule 4. Failing loudly at build time forces a human decision. Divya's real gap is 3 points
(94 declared, 91 observed) against an 8-point tolerance, so this never fires today.

---

## 6. Observation tolerance fixed at 8 points

**Ambiguity.** Step 3 says shade red "where observed < declared beyond ~8 points" but no
tolerance was specified for the record's plain-language sentence.

**Decision.** One constant, `TOLERANCE_POINTS = 8` in `lib/provenance.ts`, drives the chart
shading, the divergence stat, the record's reconciliation sentence, the build-time
invariant, and the scope-and-limitations block.

**Why.** A single source means the document can never contradict the chart. Change it in
one place.

---

## 7. Divya's observed-state lines are derived from the ground photographs

**Ambiguity.** The record needs "3–4 factual lines" of observed state, but Divya is REAL
and I may not invent observations.

**Decision.** The four lines describe only what the 13 real photographs actually show
(roads formed and surfaced, UG drainage, borewell, layout demarcation, park, streetlights).
The record additionally prints an italic note that imagery is placeholder and photo dates
are unverified, so the record "is not evidentially complete".

**Why.** These are readings of real images, not inventions. But the dates behind them are
unverified, so the record says so rather than implying a complete evidence chain.

---

## 8. Fonts load through `next/font/google`

**Ambiguity.** Step 2a says "self-host fonts via `next/font`. No runtime Google Fonts request."

**Decision.** Used `next/font/google`, not `next/font/local`.

**Why.** `next/font/google` downloads the font files **at build time** and serves them from
your own origin — there is no runtime request to Google, which is the actual requirement.
`next/font/local` would have required committing binary font files I'd have to source from
somewhere. Trade-off: the *build machine* needs network access. Vercel has it.

---

## 9. Four fonts, not two

**Ambiguity.** You named Cormorant Garamond (display) + DM Sans (body). But `vantis/`
uses Syne as its real display face everywhere, and `DESIGN_SYSTEM.md` mandates DM Mono for
every numeric and label — described as "the Vantis fingerprint".

**Decision.** Loaded all four. Cormorant Garamond for page titles and the record's masthead
(per your spec), DM Sans for body, DM Mono for all data/labels, Syne for the VANTIS
wordmark and KPI numerals only.

**Why.** Dropping DM Mono would have visibly broken continuity with `vantis/`; dropping
Syne would have changed the wordmark. Fonts cost no runtime dependency.

---

## 10. Photographs recompressed to ~150–225 KB

**Ambiguity.** Step 4 sets a 300 KB ceiling. Eight of the thirteen source photos exceeded it
(up to 386 KB).

**Decision.** Downscaled to 1200px max edge, quality stepped down until under 170 KB where
possible. Three already-optimised files are copied through untouched because re-encoding
made them *larger*. Total ground-record payload: 2.3 MB, all lazy-loaded below the fold.

**Why.** The strip renders at 210px wide; 1200px is already generous. The compressor
refuses to emit a file larger than its source.

---

## 11. Map fallback pin positions are a least-squares fit

**Ambiguity.** Step 4 says "compute approximate positions from lat/lng at build time" for
the SVG fallback, but the bundled SVG is in an arbitrary 1634×2367 coordinate space with no
published projection.

**Decision.** Fitted a linear lat/lng → viewBox transform by least squares over all 31
district label anchors against their approximate centroids. Mean residual ~30 units (~2% of
canvas), worst ~114 (~5%). Constants are in `components/map/KarnatakaFallback.tsx`.

**Why.** Good enough for "approximate", and honest about being approximate. Every project's
`location` is already marked `approx: true` where relevant.

---

## 12. The tile fallback triggers on three signals, not one

**Ambiguity.** Step 4 specifies a 3-second timeout.

**Decision.** The bundled SVG takes over on **any** of: no tile loaded within 3 s, three
tile errors, or `navigator.onLine === false`. Whichever fires first wins, and the decision
is latched so the map never flickers between the two.

**Why.** On hostile campus wifi the likely failure is a hanging request, but a captive
portal returns errors fast and an offline laptop should not wait 3 s. This was not
hypothetical — the fallback fired during development because the build environment has no
outbound network, so it has been exercised repeatedly.

---

## 13. Six district-map risk fields were stripped on copy

**Decision.** `vantis/components/shared/KarnatakaMap.tsx` carried a `risk` field per
district ('compliant' | 'caution' | 'high-risk') and a `projects` array naming real
projects. `scripts/extract_map.py` keeps only `id`, `label`, `d`, `lx`, `ly`.

**Why.** Rule 6. District-level risk colouring implies a claim about every developer in that
district.

---

## 14. Pending REAL projects still have a record route

**Ambiguity.** Step 5 requires all six `/record/[id]` routes to render, but three projects
have no declared figure, no observation and no imagery.

**Decision.** Their records render the full document skeleton — header, scope, issue block,
watermark, disclaimer — with each empty section stating plainly that source data is pending
and that no figure has been estimated in its place. The issue block adds
"Provisional — source data pending".

**Why.** It renders honestly rather than 404-ing, and it demonstrates that the format
degrades gracefully — arguably a point in the format's favour when a judge clicks it.

---

## 15. The live CARTO tile path could not be tested here — verify it before the pitch

**Not a decision — a disclosure, and the one thing I could not verify.**

The build environment has no outbound network. Every time the portfolio map rendered during
development, the **fallback** fired and the bundled SVG outline took over. That path is
therefore extremely well tested: 31 districts, 6 pins, all within the viewBox, click-to-select
working.

What I could **not** exercise is the happy path — CARTO tiles actually loading, and the
Leaflet `divIcon` pins rendering on top of them.

**What to do:** open `/` on a normal internet connection and confirm the dark tile basemap
appears with six gold pins on it. If it does, both paths are proven. If it does not, the
fallback still carries the demo — which is the point of rule 12 — but tell me and I will fix
the tile layer.

Everything downstream of the tile decision (pin colours, the S badge, selection, the card)
is shared between both paths and is verified.

---

## 16. `next build` must not run while `next dev` is live

**Not a design decision — an operational note.** Running a production build against the same
`.next` directory as a running dev server corrupts it (`Cannot find module './vendor-chunks/…'`).
Hit once during this build; fixed by restarting dev. Stop the dev server before `npm run build`.
