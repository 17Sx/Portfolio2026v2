import {
  AboutSection,
  CvSection,
  ExperienceSection,
  HomeFooter,
  HomeHeader,
  StatsSection,
} from '../sections/home/index.ts'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-6 h-full flex flex-col">
      <HomeHeader />
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
