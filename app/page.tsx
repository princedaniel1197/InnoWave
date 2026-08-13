import Header from '@/components/Header'
import { PROJECTS } from '@/lib/data'
import PortfolioClient from './PortfolioClient'

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <PortfolioClient projects={PROJECTS} />
    </main>
  )
}
