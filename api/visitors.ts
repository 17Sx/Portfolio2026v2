import type { VercelRequest, VercelResponse } from '@vercel/node'

const WORKSPACE = process.env.COUNTERAPI_WORKSPACE
const COUNTER = process.env.COUNTERAPI_NAME ?? 'visits'
const API_KEY = process.env.COUNTERAPI_KEY

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (!WORKSPACE) {
    res.json({ count: null })
    return
  }

  try {
    const url = `https://api.counterapi.dev/v2/${WORKSPACE}/${COUNTER}/up`
    const headers: Record<string, string> = {}
    if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`

    const response = await fetch(url, { headers })
    if (!response.ok) {
      res.json({ count: null })
      return
    }

    const data = (await response.json()) as { data?: { up_count?: number } }
    const count = data.data?.up_count

    res.json({ count: typeof count === 'number' ? count : null })
  } catch {
    res.status(500).json({ count: null })
  }
}
