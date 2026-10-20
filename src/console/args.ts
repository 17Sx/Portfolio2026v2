// Interprétation des arguments des commandes du shell : sans DOM, pour être testable avec node --test.

/** Sans valeur, passe à l'option suivante ; avec une valeur, la garde si elle est permise, sinon null */
export function resolveToggle<T extends string>(value: unknown, current: T, options: readonly T[]): T | null {
  if (value === undefined) {
    const index = options.indexOf(current)
    return options[(index + 1) % options.length]
  }
  return options.find((option) => option === value) ?? null
}

/** `rm('-rf')`, `rm('-r', '-f')`, `rm('/')` : tout ce qui ressemble à une suppression récursive ou forcée */
export function isDestructiveRm(flags: readonly string[]) {
  return flags.some((flag) => /^-[a-z]*[rf]/i.test(flag) || flag === '/')
}
