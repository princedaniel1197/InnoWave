import { notFound } from 'next/navigation'

import Header from '@/components/Header'
import { PROJECTS, getFrames, getPhotos, getProject } from '@/lib/data'
import SiteContent from './SiteContent'

export function generateStaticParams() {
  return PROJECTS.map(p => ({ id: p.id }))
}

export const dynamicParams = false

export default function Page({ params }: { params: { id: string } }) {
  const project = getProject(params.id)
  if (!project) notFound()

  return (
    <main className="min-h-screen flex flex-col">
      <Header back={{ href: '/', label: 'Portfolio' }} />
      <SiteContent
        project={project}
        frames={getFrames(project.id)}
        photos={getPhotos(project.id)}
      />
    </main>
  )
}
