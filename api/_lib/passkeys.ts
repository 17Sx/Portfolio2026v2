import { insertPasskey, listPasskeys, storeConfigured, touchPasskey, type StoredPasskey } from './store.js'

// Registered passkeys: in Postgres when a database is configured, otherwise in this instance's memory
// (local development and tests only; they vanish when the dev server restarts).

export const MAX_PASSKEYS = 10

const memory = new Map<string, StoredPasskey>()

export function resetMemoryPasskeys() {
  memory.clear()
}

export async function allPasskeys(): Promise<StoredPasskey[]> {
  return storeConfigured() ? listPasskeys() : [...memory.values()]
}

export async function findPasskey(id: string): Promise<StoredPasskey | undefined> {
  return (await allPasskeys()).find((passkey) => passkey.id === id)
}

export async function savePasskey(passkey: StoredPasskey): Promise<void> {
  if (storeConfigured()) await insertPasskey(passkey)
  else memory.set(passkey.id, passkey)
}

export async function recordPasskeyUse(id: string, counter: number, now: number): Promise<void> {
  if (storeConfigured()) {
    await touchPasskey(id, counter, now)
    return
  }
  const passkey = memory.get(id)
  if (passkey) memory.set(id, { ...passkey, counter })
}

export function encodeKey(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url')
}

export function decodeKey(text: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Buffer.from(text, 'base64url'))
}
