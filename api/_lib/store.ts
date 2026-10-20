import postgres from 'postgres'
import type { FeedEntry } from '../../shared/stats-schema.js'
import { FEED_LENGTH, LIVE_WINDOW_MS } from './schema.js'

// Postgres storage (Neon on Vercel). Counters live in one table keyed by
// (scope, field): scope is `d:YYYY-MM-DD`, `m:YYYY-MM` or `all`, field is `dim|value`.

function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined
}

export function storeConfigured(): boolean {
  return databaseUrl() !== undefined
}

/** Secret mixed into visitor hashes; never leaves the server. */
export function hashSecret(): string {
  return process.env.STATS_SALT ?? databaseUrl() ?? ''
}

let client: postgres.Sql | null = null
let schema: Promise<void> | null = null

function db(): postgres.Sql {
  const url = databaseUrl()
  if (!url) throw new Error('DATABASE_URL is not configured')
  // One connection per function instance; prepare: false for Neon's pgbouncer pooler.
  client ??= postgres(url, { max: 1, prepare: false, idle_timeout: 20, connect_timeout: 10 })
  return client
}

/** Creates the tables on first use; the advisory lock serialises concurrent cold starts. */
function ready(): Promise<void> {
  schema ??= db()
    .begin(async (sql) => {
      await sql`select pg_advisory_xact_lock(1752461)`
      await sql`
        create table if not exists stats_counters (
          scope text not null,
          field text not null,
          n bigint not null default 0,
          primary key (scope, field)
        )`
      await sql`
        create table if not exists stats_visitors (
          scope text not null,
          hash text not null,
          primary key (scope, hash)
        )`
      await sql`create table if not exists stats_live (sid text primary key, seen_at bigint not null)`
      await sql`create index if not exists stats_live_seen_at on stats_live (seen_at)`
      await sql`create table if not exists stats_feed (id bigserial primary key, entry jsonb not null)`
    })
    .then(
      () => undefined,
      (error: unknown) => {
        schema = null
        throw error
      },
    )
  return schema
}

export type RecordInput = {
  /** Scopes every counter is added to (day, month, all-time). */
  counterScopes: string[]
  counts: [string, number][]
  /** Daily-salted visitor hash and the scopes it is unique within, or null. */
  visitor: { hash: string; scopes: string[] } | null
  /** Session id refreshed in the live table, or null. */
  sid: string | null
  feed: FeedEntry | null
  now: number
}

export async function record(input: RecordInput): Promise<void> {
  await ready()
  await db().begin(async (sql) => {
    if (input.counts.length > 0) {
      const fields = input.counts.map(([field]) => field)
      const increments = input.counts.map(([, n]) => n)
      await sql`
        insert into stats_counters (scope, field, n)
        select s.scope, c.field, c.n
        from unnest(${input.counterScopes}::text[]) as s(scope)
        cross join unnest(${fields}::text[], ${increments}::bigint[]) as c(field, n)
        on conflict (scope, field) do update set n = stats_counters.n + excluded.n`
    }
    if (input.visitor) {
      await sql`
        insert into stats_visitors (scope, hash)
        select scope, ${input.visitor.hash} from unnest(${input.visitor.scopes}::text[]) as s(scope)
        on conflict do nothing`
    }
    if (input.sid) {
      await sql`
        insert into stats_live (sid, seen_at) values (${input.sid}, ${input.now})
        on conflict (sid) do update set seen_at = excluded.seen_at`
      await sql`delete from stats_live where seen_at < ${input.now - LIVE_WINDOW_MS * 2}`
    }
    if (input.feed) {
      await sql`insert into stats_feed (entry) values (${sql.json(input.feed)})`
      await sql`
        delete from stats_feed
        where id <= (select id from stats_feed order by id desc offset ${FEED_LENGTH} limit 1)`
    }
  })
}

export type CounterRow = { scope: string; field: string; n: number }

export async function readCounters(list: string[]): Promise<CounterRow[]> {
  await ready()
  const rows = await db()<{ scope: string; field: string; n: string }[]>`
    select scope, field, n from stats_counters where scope = any(${list}::text[])`
  return rows.map((r) => ({ scope: r.scope, field: r.field, n: Number(r.n) }))
}

/** Unique visitors per scope, and across all of them (daily hashes never repeat across days). */
export async function readUniques(list: string[]): Promise<{ perScope: Record<string, number>; total: number }> {
  await ready()
  const sql = db()
  const [rows, [total]] = await Promise.all([
    sql<{ scope: string; count: string }[]>`
      select scope, count(*) as count from stats_visitors where scope = any(${list}::text[]) group by scope`,
    sql<{ count: string }[]>`select count(distinct hash) as count from stats_visitors where scope = any(${list}::text[])`,
  ])
  return { perScope: Object.fromEntries(rows.map((r) => [r.scope, Number(r.count)])), total: Number(total?.count ?? 0) }
}

/** Every month that has data, oldest first. */
export async function readMonths(): Promise<string[]> {
  await ready()
  const rows = await db()<{ scope: string }[]>`
    select distinct scope from stats_counters where scope like 'm:%' order by scope`
  return rows.map((r) => r.scope.slice(2))
}

export async function readLive(now: number, feedSize: number): Promise<{ live: number; feed: unknown[] }> {
  await ready()
  const sql = db()
  const [[count], feed] = await Promise.all([
    sql<{ count: string }[]>`select count(*) as count from stats_live where seen_at >= ${now - LIVE_WINDOW_MS}`,
    sql<{ entry: unknown }[]>`select entry from stats_feed order by id desc limit ${feedSize}`,
  ])
  return { live: Number(count?.count ?? 0), feed: feed.map((r) => r.entry) }
}
