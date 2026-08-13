import { notFound } from 'next/navigation'

import Header from '@/components/Header'
import VPRDocument from '@/components/record/VPRDocument'
import { PROJECTS, displayName, getProject } from '@/lib/data'
import RecordChrome from './RecordChrome'

export function generateStaticParams() {
  return PROJECTS.map(p => ({ id: p.id }))
}

export const dynamicParams = false

export default function Page({ params }: { params: { id: string } }) {
  const project = getProject(params.id)
  if (!project) notFound()

  return (
    <main className="min-h-screen flex flex-col">
      <Header back={{ href: `/site/${project.id}`, label: displayName(project) }} />

      <div className="max-w-[900px] w-full mx-auto px-6 sm:px-8 py-6">
        <RecordChrome projectId={project.id} />
        <VPRDocument p={project} />
        <p className="print-hide text-[11px] text-dim mt-5 leading-relaxed text-center max-w-[70ch] mx-auto">
          Every record produced by this build carries a SPECIMEN watermark and is marked not issued
          for reliance. Records for synthetic projects additionally carry SPECIMEN — SYNTHETIC
          SCENARIO.
        </p>
      </div>
    </main>
  )
}
