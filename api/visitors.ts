import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch('https://api.counterapi.dev/v1/17sx-portfolio/visits/up')
    const data = await response.json() as { count: number }
    res.setHeader('Cache-Control', 'no-store')
    res.json({ count: data.count })
  } catch {
    res.status(500).json({ count: null })
  }
}
