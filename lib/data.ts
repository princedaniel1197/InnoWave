import projectsRaw from '@/data/projects.json'
import divyaFrames from '@/data/frames/divya-villas/frames.json'
import meridianFrames from '@/data/frames/project-meridian/frames.json'
import divyaPhotos from '@/data/photos/divya-villas/photos.json'

import type { FramesManifest, PhotosManifest, Project } from './types'
import { assertProvenanceInvariants } from './provenance'

/**
 * Static imports only — CLAUDE.md rule 3 forbids runtime fetching.
 * Manifests are keyed by project id rather than resolved from the path string
 * in projects.json, because a bundler cannot follow a dynamic path.
 */
const FRAMES: Record<string, FramesManifest> = {
  'divya-villas': divyaFrames as FramesManifest,
  'project-meridian': meridianFrames as FramesManifest,
}

const PHOTOS: Record<string, PhotosManifest> = {
  'divya-villas': divyaPhotos as PhotosManifest,
}

export const PROJECTS = projectsRaw as unknown as Project[]

/* Fails the build rather than reaching a judge's screen. */
assertProvenanceInvariants(PROJECTS)

export function getProject(id: string): Project | undefined {
  return PROJECTS.find(p => p.id === id)
}

export function getFrames(id: string): FramesManifest | null {
  return FRAMES[id] ?? null
}

export function getPhotos(id: string): PhotosManifest | null {
  return PHOTOS[id] ?? null
}

/** Public frame path for a project's frame file. */
export function framePath(projectId: string, file: string): string {
  return `/frames/${projectId}/${file}`
}

export function photoPath(projectId: string, file: string): string {
  return `/photos/${projectId}/${file}`
}

/** The name to show — falls back to the neutral placeholder while pending. */
export function displayName(p: Project): string {
  return p.name === 'FILL_FROM_KRERA_PORTAL'
    ? p.display_placeholder ?? 'Project — data pending'
    : p.name
}

export function displayPromoter(p: Project): string {
  return p.promoter === 'FILL_FROM_KRERA_PORTAL' ? 'Promoter — data pending' : p.promoter
}

export function displayRera(p: Project): string {
  return p.rera_no === 'FILL_FROM_KRERA_PORTAL' ? 'RERA no. — data pending' : p.rera_no
}

/* ── Portfolio counters. Derived, never hand-written — CLAUDE.md rule 4. ──── */
export const PORTFOLIO = {
  monitored: PROJECTS.length,
  recordsIssued: PROJECTS.filter(p => !p.record_no.includes('PENDING')).length,
  divergencesFlagged: PROJECTS.filter(p => p.status === 'divergence').length,
  awaitingData: PROJECTS.filter(p => p.rera_no === 'FILL_FROM_KRERA_PORTAL').length,
}
