export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="shrink-0 font-mono text-sm uppercase tracking-widest text-black/50 md:w-36">
      {children}
    </p>
  )
}
