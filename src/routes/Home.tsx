import {
  AboutSection,
  CvSection,
  ExperienceSection,
  HomeFooter,
  HomeHeader,
  ProjectsSection,
  StatsSection,
} from '../sections/home/index.ts'

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <HomeHeader />
      <AboutSection />
      <StatsSection />
      <ExperienceSection />
      <ProjectsSection />
      <CvSection />
      <HomeFooter />
    </div>
  )
}
