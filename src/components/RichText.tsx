export function Rich({
  text,
  strongClassName = 'font-semibold text-zinc-900 dark:text-zinc-50',
}: {
  text: string
  strongClassName?: string
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={index} className={strongClassName}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}
