export function SectionLabel({ children }: { children: string }) {
  return (
    <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 md:w-36">
      {children}
    </p>
  )
}
