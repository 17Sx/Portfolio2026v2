// Tests des helpers sans DOM du shell de la console (src/console/args.ts) et de la garde
// des ids de section. Lancer avec `npm test` (Node ≥ 22.18, qui exécute le TypeScript directement).
import assert from 'node:assert/strict'
import { test } from 'node:test'

const { resolveToggle, isDestructiveRm } = await import('../src/console/args.ts')
const { isSectionId, SECTION_IDS } = await import('../src/content/work.ts')

const THEMES = ['light', 'dark']

test('resolveToggle sans valeur passe à l’option suivante, en boucle', () => {
  assert.equal(resolveToggle(undefined, 'light', THEMES), 'dark')
  assert.equal(resolveToggle(undefined, 'dark', THEMES), 'light')
})

test('resolveToggle garde une valeur permise et refuse le reste', () => {
  assert.equal(resolveToggle('dark', 'light', THEMES), 'dark')
  assert.equal(resolveToggle('light', 'light', THEMES), 'light')
  assert.equal(resolveToggle('blue', 'light', THEMES), null)
  assert.equal(resolveToggle(1, 'light', THEMES), null)
  assert.equal(resolveToggle(null, 'light', THEMES), null)
})

test('isDestructiveRm reconnaît les formes récursives ou forcées', () => {
  assert.equal(isDestructiveRm(['-rf']), true)
  assert.equal(isDestructiveRm(['-rf', '/']), true)
  assert.equal(isDestructiveRm(['-r', 'projects']), true)
  assert.equal(isDestructiveRm(['-Rf']), true)
  assert.equal(isDestructiveRm(['/']), true)
})

test('isDestructiveRm laisse passer un rm ordinaire', () => {
  assert.equal(isDestructiveRm([]), false)
  assert.equal(isDestructiveRm(['notes.txt']), false)
  assert.equal(isDestructiveRm(['-v', 'notes.txt']), false)
  assert.equal(isDestructiveRm(['rf']), false)
})

test('isSectionId n’accepte que les ids de SECTION_IDS', () => {
  for (const id of SECTION_IDS) assert.equal(isSectionId(id), true)
  assert.equal(isSectionId('settings'), false)
  assert.equal(isSectionId(''), false)
  assert.equal(isSectionId(undefined), false)
  assert.equal(isSectionId(['projects']), false)
})
