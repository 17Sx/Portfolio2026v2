// Minimal Upstash Redis REST client: one HTTP round trip per pipeline, no SDK.

type Command = (string | number)[]

function config() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

export function redisConfigured(): boolean {
  return config() !== null
}

/** Secret mixed into visitor hashes; never leaves the server. */
export function hashSecret(): string {
  return process.env.STATS_SALT ?? config()?.token ?? ''
}

export async function pipeline(commands: Command[]): Promise<unknown[]> {
  const cfg = config()
  if (!cfg) throw new Error('Redis is not configured')
  if (commands.length === 0) return []

  const response = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!response.ok) throw new Error(`Redis responded ${response.status}`)

  const items = (await response.json()) as { result?: unknown; error?: string }[]
  return items.map((item, i) => {
    if (item.error) throw new Error(`Redis command ${String(commands[i][0])} failed: ${item.error}`)
    return item.result
  })
}
