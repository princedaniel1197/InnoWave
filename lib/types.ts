/** Data provenance. This field is law — see CLAUDE.md rule 4. */
export type Provenance = 'REAL' | 'SYNTHETIC'

/**
 * Project status.
 * `verified` / `monitored` are the only statuses a REAL entity may hold.
 * `watch` / `divergence` are fault-implying and reachable only by SYNTHETIC entities.
 */
export type ProjectStatus = 'verified' | 'monitored' | 'watch' | 'divergence'

export interface ProgressPoint {
  date: string
  pct: number
  /** Where the promoter's figure came from — an actual filing, or a PENDING marker. */
  source?: string
  /** How the observed figure was arrived at — imagery, ground record, or a PENDING marker. */
  basis?: string
  /**
   * True when this point is not backed by an actual filing or an actual image.
   * Renders hollow, dotted, and labelled. See CLAUDE.md rule 4.
   */
  interpolated: boolean
}

export interface Location {
  lat: number
  lng: number
  label: string
  /** Set when the coordinate is approximate and awaiting founder correction. */
  approx?: boolean
}

export interface Project {
  id: string
  /** Literal 'FILL_FROM_KRERA_PORTAL' where the identity is a founder-input slot. */
  name: string
  /** Neutral label shown while `name` is still a founder-input slot. */
  display_placeholder?: string
  promoter: string
  /** Literal 'FILL_FROM_KRERA_PORTAL' where pending. Never invented. */
  rera_no: string
  provenance: Provenance
  status: ProjectStatus
  location: Location
  declared_series: ProgressPoint[]
  observed_series: ProgressPoint[]
  frames_manifest: string | null
  photos_manifest: string | null
  record_no: string
  /** One-line scenario note. Required on SYNTHETIC entities. */
  scenario_note?: string

  /* ── Verified registry detail. Present only where documents corroborate. ── */
  promoter_pan?: string
  registered_office?: string
  survey_numbers?: string
  district?: string
  finance?: ProjectFinance
  designated_account?: DesignatedAccount
  delay_cause?: string
  encumbrance_period?: string

  /**
   * The argument this project carries on its own page. Kept in data rather
   * than hard-coded in a screen so a project can never inherit another
   * project's story — see DECISIONS.md on the escrow framing.
   */
  thesis?: { heading: string; body: string[] }
  /** Factual observed-state lines for the VPR document. */
  observed_state?: string[]
  capture_provenance?: CaptureRecord[]
}

export interface CaptureRecord {
  source_type: string
  operator: string
  capture_dates: string
  frame_refs: string
}

/**
 * Figures as filed. Stored as strings in the exact form they appear in the
 * source documents — never parsed to Number, never re-grouped, never rounded.
 * Renderers may prefix a currency unit but may not alter the digits.
 */
export interface ProjectFinance {
  project_cost: string
  funds_utilised_to_date: string
  promoter_own_funds: string
  total_borrowings: string
  lender: string
  allottee_collections: string
  source: string
}

/** Bank and IFSC only. The account number is never stored and never rendered. */
export interface DesignatedAccount {
  bank: string
  ifsc: string
}

export type FrameStatus = 'real' | 'placeholder'

export interface Frame {
  file: string
  date: string
  source: string
  status: FrameStatus
}

export interface FramesManifest {
  note: string
  project_id: string
  frames: Frame[]
}

export interface Photo {
  file: string
  caption: string
  /** Literal 'PENDING_VERIFICATION' until the founder confirms the capture date. */
  date: string
}

export interface PhotosManifest {
  note: string
  project_id: string
  photos: Photo[]
}
