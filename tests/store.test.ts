import postgres from 'postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Runs against a real, throwaway Postgres; skipped unless STATS_TEST_DATABASE_URL is set:
//   docker run -d --name stats-postgres -p 5433:5432 -e POSTGRES_PASSWORD=dev postgres:17-alpine
//   STATS_TEST_DATABASE_URL=postgres://postgres:dev@localhost:5433/postgres npx vitest run tests/store.test.ts # hepha-allow-secret: throwaway local Docker password
const url = process.env.STATS_TEST_DATABASE_URL

describe.skipIf(!url)('Postgres store', () => {
  let store: typeof import('../api/_lib/store.ts')
  const admin = postgres(url ?? '', { max: 1, onnotice: () => {} })
  const NOW = Date.UTC(2026, 9, 20, 12)

  beforeAll(async () => {
    await admin`drop table if exists stats_counters, stats_visitors, stats_live, stats_feed, stats_login_attempts, stats_passkeys`
    process.env.DATABASE_URL = url
    store = await import('../api/_lib/store.ts')
  })

  afterAll(async () => {
    await admin.end()
  })

  const base = { counterScopes: ['d:2026-10-20', 'm:2026-10', 'all'], visitor: null, sid: null, feed: null, now: NOW }

  it('creates its schema and adds increments to every scope, concurrently', async () => {
    await Promise.all([
      store.record({ ...base, counts: [['k|pv', 1], ['page|/', 1]] }),
      store.record({ ...base, counts: [['k|pv', 1], ['page|/stack', 1]] }),
      store.record({ ...base, counterScopes: ['d:2026-10-19', 'm:2026-10', 'all'], counts: [['k|pv', 3]] }),
    ])
    const rows = await store.readCounters(['d:2026-10-20', 'm:2026-10', 'all'])
    const byKey = Object.fromEntries(rows.map((r) => [`${r.scope} ${r.field}`, r.n]))
    expect(byKey).toEqual({
      'd:2026-10-20 k|pv': 2,
      'd:2026-10-20 page|/': 1,
      'd:2026-10-20 page|/stack': 1,
      'm:2026-10 k|pv': 5,
      'm:2026-10 page|/': 1,
      'm:2026-10 page|/stack': 1,
      'all k|pv': 5,
      'all page|/': 1,
      'all page|/stack': 1,
    })
    expect(await store.readMonths()).toEqual(['2026-10'])
  })

  it('counts each visitor hash once per scope', async () => {
    const visit = (hash: string, day: string) =>
      store.record({ ...base, counts: [], visitor: { hash, scopes: [`d:${day}`, 'm:2026-10'] } })
    await visit('aaa', '2026-10-20')
    await visit('aaa', '2026-10-20')
    await visit('bbb', '2026-10-20')
    await visit('ccc', '2026-10-21')
    const uniques = await store.readUniques(['d:2026-10-20', 'd:2026-10-21'])
    expect(uniques).toEqual({ perScope: { 'd:2026-10-20': 2, 'd:2026-10-21': 1 }, total: 3 })
  })

  it('keeps live sessions inside the window and trims the feed to its last entries', async () => {
    await store.record({ ...base, counts: [], sid: 'old', now: NOW - 6 * 60_000 })
    await store.record({ ...base, counts: [], sid: 'fresh' })
    await store.record({ ...base, counts: [], sid: 'fresh' })
    for (let i = 0; i < 105; i++) {
      await store.record({
        ...base,
        counts: [],
        feed: { ts: i, t: 'pv', path: `/${i}`, country: 'FR', city: 'Paris', browser: 'Chrome', os: 'macOS', device: 'desktop' },
      })
    }
    const { live, feed } = await store.readLive(NOW, 40)
    expect(live).toBe(1)
    expect(feed).toHaveLength(40)
    expect(feed[0]).toMatchObject({ ts: 104, path: '/104' })
    const [{ count }] = await admin<{ count: string }[]>`select count(*) as count from stats_feed`
    expect(Number(count)).toBe(100)
  })

  it('counts login attempts like nextAttempt(), atomically under a parallel burst', async () => {
    const { nextAttempt } = await import('../api/_lib/login-guard.ts')
    const policy = { max: 5, windowMs: 60_000, lockMs: 120_000 }

    const burst = await Promise.all(Array.from({ length: 20 }, () => store.registerLoginAttempt('ip:burst', NOW, policy)))
    expect(burst.filter((row) => row.lockedUntil <= NOW)).toHaveLength(policy.max)

    // Same sequence through SQL and through the in-memory rules
    let expected: ReturnType<typeof nextAttempt> | undefined
    for (const at of [0, 10, 20, 30, 40, 50, 60, 130_000, 200_000]) {
      expected = nextAttempt(expected, NOW + at, policy)
      expect(await store.registerLoginAttempt('ip:seq', NOW + at, policy)).toEqual(expected)
    }

    await store.clearLoginAttempts('ip:seq')
    expect(await store.registerLoginAttempt('ip:seq', NOW, policy)).toEqual({ fails: 1, windowStart: NOW, lockedUntil: 0 })
  })

  it('stores passkeys and updates their counter', async () => {
    await store.insertPasskey({ id: 'cred-a', publicKey: 'pk-a', counter: 0, transports: ['internal', 'hybrid'], createdAt: NOW })
    await store.insertPasskey({ id: 'cred-b', publicKey: 'pk-b', counter: 3, transports: [], createdAt: NOW + 1 })
    await expect(store.insertPasskey({ id: 'cred-a', publicKey: 'x', counter: 0, transports: [], createdAt: NOW })).rejects.toThrow()

    await store.touchPasskey('cred-b', 7, NOW + 2)
    expect(await store.listPasskeys()).toEqual([
      { id: 'cred-a', publicKey: 'pk-a', counter: 0, transports: ['internal', 'hybrid'], createdAt: NOW },
      { id: 'cred-b', publicKey: 'pk-b', counter: 7, transports: [], createdAt: NOW + 1 },
    ])
  })
})
