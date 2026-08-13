# vantis-build — Verified Progress Record

A standalone demo of the **Verified Progress Record (VPR)**: an independently produced,
evidence-backed record of what has physically been built on a construction site as of a
date — designed to be relied on by a lender, an escrow bank, or a regulator who was never
on site.

Under RERA s.4(2)(l)(D), money leaves a project's mandatory 70% account against completion
certificates (in Karnataka: Forms Ex3–Ex6 and quarterly Forms 4/5/6) produced by an
engineer, architect and CA who are all appointed and paid by the promoter. Nobody
independently verifies them. The VPR is the independent evidence layer: satellite baseline
+ drone capture + ground photographs, reconciled against declared progress, issued as a
fixed-format record.

This is a **demonstration build**. Every record it produces carries a SPECIMEN watermark
and is marked *not issued for reliance*.

---

## Run it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

> Stop the dev server before running `npm run build` — sharing a `.next` directory between
> the two corrupts it.

## Routes

| Route | What it is |
|---|---|
| `/` | Portfolio. Karnataka map, six project pins, KPI rail, status legend. |
| `/site/divya-villas` | The honest case — real project, declared and observed agree. |
| `/site/bengaluru-monitored-a` · `-b` · `-c` | Real, monitored, awaiting source data. |
| `/site/project-kaveri` | Synthetic — mild drift over eight quarters. |
| `/site/project-meridian` | Synthetic — the hero divergence case, 62% declared vs 38% observed. |
| `/record/<any of the six ids>` | The VPR document for that project. Prints to one A4 page. |

All twelve `/site` and `/record` routes are statically generated. There are no other routes,
no API routes, no database, no auth and no environment variables.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run sweep` | **Honesty sweep** — walks every route on a running server and asserts the provenance rules against rendered HTML. 36 checks. |
| `npm run routes` | Every route returns 200 and every asset it references resolves. 13 routes. |
| `npm run assets` | Rebuilds `public/photos`, `public/frames`, `public/brand`. Needs Python + Pillow. |
| `npm run map` | Re-extracts Karnataka district outlines. Needs the `vantis/` repo present. |

`npm run assets` and `npm run map` are **build-time tooling only** and are the only things
in this repo that ever look at `vantis/`. Their outputs are committed, so the app builds and
runs with `vantis/` deleted from disk.

---

## Where the founder drops real content

### Satellite / drone frames

```
public/frames/divya-villas/frame-2024-01.jpg
public/frames/divya-villas/frame-2024-06.jpg
public/frames/divya-villas/frame-2024-11.jpg
public/frames/divya-villas/frame-2025-04.jpg
public/frames/divya-villas/frame-2025-08.jpg
public/frames/divya-villas/frame-2025-12.jpg
```

1. Export from Google Earth Pro historical imagery. **All frames must share identical
   centre, zoom and dimensions** — the wipe slider stacks them pixel-on-pixel. 1200×800.
2. Overwrite the file above, keeping the exact filename.
3. In `data/frames/divya-villas/frames.json`, flip that frame's `"status"` from
   `"placeholder"` to `"real"`, and correct its `"date"` if the export differs.

When every frame in a series is `"real"`, the PLACEHOLDER IMAGERY chip disappears on its own.

> `public/frames/project-meridian/` is a **synthetic** series, watermarked SYNTHETIC inside
> the images themselves. Never replace those with real imagery under that project id.

### Ground photographs

Already dropped in — the 13 real Divya Villas site photographs are at
`public/photos/divya-villas/`, recompressed from the originals.

What's still needed is their **capture dates**. In `data/photos/divya-villas/photos.json`,
replace `"PENDING_VERIFICATION"` with an ISO date (`"2025-12-06"`). Until then each photo
renders "date pending verification".

---

## Verified and loaded (session 2)

Divya Villas now carries document-corroborated data throughout — promoter and PAN, registered
office, survey numbers, district, the Form Ex3/Ex4 financial position, the designated account
(bank and IFSC only), the encumbrance period, the Supreme Court extension cause, and the 94%
declared figure cited to Form Ex5 of 06.12.2025 and the Form Ex7 affidavit of 15.12.2025.

Figures render exactly as filed. Nothing in this repo parses, sums or differences them.

## Founder-input checklist

Everything still awaiting your input, in one place.

### `data/projects.json` — Divya Villas

| Field | Current value | Needed |
|---|---|---|
| `location.lat` / `.lng` | `12.35, 76.62`, `approx: true` | Exact site coordinates. Drop `approx` when set. |
| `observed_series[0].basis` | `"estimated from imagery — pending founder annotation"` | Your annotation of the 06.12.2025 imagery. |
| `capture_provenance[0].capture_dates` | `"PENDING — founder to confirm on frame export"` | Actual archive capture dates. |

### `data/projects.json` — the three monitored projects

| Field | Current value | Needed |
|---|---|---|
| `name` | `FILL_FROM_KRERA_PORTAL` | Project name — read `DECISIONS.md` §1 first. |
| `promoter` | `FILL_FROM_KRERA_PORTAL` | Promoter name. |
| `rera_no` | `FILL_FROM_KRERA_PORTAL` | RERA registration number. |
| `declared_series[0]` | `date: FILL_FROM_KRERA_PORTAL`, `pct: -1` | One declared figure with its date and filing source. `pct: -1` is the pending sentinel — the UI shows an em-dash, never a number. |
| `location` | Whitefield / Hebbal / Sarjapur Road, `approx: true` | Real site coordinates once chosen. |

### `data/photos/divya-villas/photos.json`

All 13 entries: `"date": "PENDING_VERIFICATION"` → ISO date.

### `data/frames/*/frames.json`

All 12 entries: `"status": "placeholder"` → `"real"` once the real export is dropped in.

### Open question — earlier quarterly filings

Divya Villas has **one** certified progress figure on file: 94% at 06.12.2025. Registration
(0%, 18.09.2024) is the only other point. The 15 months between them carry no certified
observation, and `/site/divya-villas` says so on its face.

If earlier quarterly filings (Forms 4/5/6) exist and can be retrieved, they belong in
`declared_series` with their filing references, and the page will switch back to a two-line
chart automatically once a second **observed** point also exists.

`vantis/data/qpr.json` holds an unsourced quarterly series (Q4'24 35% → Q1'26 96%) that was
**not** imported — see `DECISIONS.md` §3. Confirm or discard it.

---

## Deploy

No environment variables. No build-time secrets.

1. Push to a **private** GitHub repo.
2. Vercel → *Add New Project* → import that repo.
3. Framework preset: **Next.js**. Build command, output dir and install command: leave as
   detected. Root directory: repo root.
4. Deploy. The URL is what goes into the submission.

The one runtime external call is the CARTO dark tile layer. If it fails — captive portal,
hostile wifi, offline laptop — the map swaps to a bundled SVG outline of Karnataka with the
pins positioned from lat/lng. **The demo never shows a broken grey map.**

> **Check this once on a real connection before the pitch:** the build environment had no
> outbound network, so the fallback path is thoroughly tested but the live-tile path is not.
> Open `/` online and confirm the dark basemap appears under the six pins. See
> `DECISIONS.md` §15.

---

## The honesty rules

`CLAUDE.md` carries the eight non-negotiable ground rules verbatim, plus four standing rules
for this repo. The short version:

- Every project carries `provenance: "REAL" | "SYNTHETIC"`.
- A REAL entity may never carry an amber/red status, a divergence flag, or any fault-implying
  claim. This is enforced at build time in `lib/provenance.ts` — a violation throws and fails
  the build rather than reaching a judge's screen.
- Every SYNTHETIC entity is chipped **SYNTHETIC — ILLUSTRATIVE** everywhere it renders,
  including inside charts and inside the record document.
- Roadmap capabilities (computer vision, automated change detection, drone-dock ops) are
  labelled **ROADMAP** wherever referenced and are never presented as live.
- Any chart point not backed by an actual filing or an actual image renders hollow with a
  dotted connector and is labelled *interpolated*.
- Pending fields are never filled with estimates. They render a DATA PENDING chip.

Run `npm run sweep` against a running server to verify all of the above against the actually
rendered HTML.

`DECISIONS.md` records every ambiguous call taken during the build and the reasoning.
