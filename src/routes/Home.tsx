import {
  AboutSection,
  CvSection,
  ExperienceSection,
  HomeFooter,
  StatsSection,
} from '../sections/home/index.ts'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-8 pb-6 h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-between">
        <AboutSection />
        <StatsSection />
        <ExperienceSection />
        <CvSection />
        <HomeFooter />
      </div>
    </div>
  )
}
