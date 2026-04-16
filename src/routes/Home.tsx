import {
  AboutSection,
  CvSection,
  ExperienceSection,
  HomeFooter,
  StatsSection,
} from '../sections/home/index.ts'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 pb-20 md:pb-6 h-full flex flex-col overflow-y-auto md:overflow-hidden">
      <div className="flex-1 flex flex-col md:justify-between gap-6 md:gap-0">
        <AboutSection />
        <StatsSection />
        <ExperienceSection />
        <CvSection />
        <HomeFooter />
      </div>
    </div>
  )
}
