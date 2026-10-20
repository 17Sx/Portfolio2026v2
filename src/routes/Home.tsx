import { useEffect } from 'react'
import {
  AboutSection,
  ExperienceSection,
  ExtraFooter,
  GithubSection,
  HomeFooter,
  MusicSection,
  ProjectsSection,
  SkillsSection,
} from '../sections/home/index.ts'

export default function Home() {
  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (!id) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <GithubSection />
      <MusicSection />
      <HomeFooter />
      <ExtraFooter />
    </>
  )
}
