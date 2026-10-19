import type { VercelRequest, VercelResponse } from '@vercel/node'

// Profil Deezer public de Noa ; surchargeable par DEEZER_USER_ID pour un fork
const USER_ID = process.env.DEEZER_USER_ID || '1809986862'
const ARTIST_LIMIT = 15
const TIMEOUT_MS = 5000
const PICTURE_HOST = 'https://cdn-images.dzcdn.net/'

type Artist = { id: number; name: string; link: string; picture: string | null }
type Track = { id: number; title: string; artist: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function getList(path: string) {
  const response = await fetch(`https://api.deezer.com/user/${USER_ID}/${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Deezer ${path}: HTTP ${response.status}`)
  const body: unknown = await response.json()
  // Deezer renvoie ses erreurs (profil privé, id inconnu) en HTTP 200
  if (!isRecord(body) || body.error || !Array.isArray(body.data)) {
    throw new Error(`Deezer ${path}: invalid response`)
  }
  return { data: body.data, total: typeof body.total === 'number' ? body.total : null }
}

// Les liens sont reconstruits depuis l'id : rien de ce que renvoie Deezer n'atterrit tel quel dans un href
function toArtist(item: unknown): Artist | null {
  if (!isRecord(item) || typeof item.id !== 'number' || typeof item.name !== 'string') return null
  const picture = typeof item.picture_small === 'string' && item.picture_small.startsWith(PICTURE_HOST) ? item.picture_small : null
  return { id: item.id, name: item.name, link: `https://www.deezer.com/artist/${item.id}`, picture }
}

function toTrack(item: unknown): Track | null {
  if (!isRecord(item) || typeof item.id !== 'number' || typeof item.title !== 'string') return null
  if (!isRecord(item.artist) || typeof item.artist.name !== 'string') return null
  return { id: item.id, title: item.title, artist: item.artist.name }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.status(405).end()
    return
  }
  // Une seule URL canonique : chaque query string différente contournerait le cache CDN et rappellerait Deezer
  if (req.url?.includes('?')) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.redirect(308, '/api/deezer')
    return
  }
  if (!/^\d+$/.test(USER_ID)) {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ music: null })
    return
  }

  const [artistsResult, tracksResult] = await Promise.allSettled([
    getList(`charts/artists?limit=${ARTIST_LIMIT}`),
    getList('charts/tracks?limit=1'),
  ])
  for (const result of [artistsResult, tracksResult]) {
    if (result.status === 'rejected') console.error(result.reason)
  }

  const artists =
    artistsResult.status === 'fulfilled'
      ? artistsResult.value.data.map(toArtist).filter((artist): artist is Artist => artist !== null)
      : []
  const onRepeat = tracksResult.status === 'fulfilled' ? toTrack(tracksResult.value.data[0]) : null

  if (artistsResult.status === 'rejected' && tracksResult.status === 'rejected') {
    // Cache négatif court, en 200 car le CDN Vercel ne met pas en cache les 5xx :
    // une panne Deezer ne fait pas rappeler l'API à chaque visite
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')
    res.json({ music: null })
    return
  }

  const total = artistsResult.status === 'fulfilled' ? artistsResult.value.total : null
  // Réponse partielle (un des deux appels a échoué) : gardée 5 min, sans longue fenêtre stale
  const partial = artistsResult.status === 'rejected' || tracksResult.status === 'rejected'
  res.setHeader(
    'Cache-Control',
    partial
      ? 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
      : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  )
  res.json({
    music: {
      profileUrl: `https://www.deezer.com/profile/${USER_ID}`,
      artists,
      moreCount: Math.max(0, (total ?? artists.length) - artists.length),
      onRepeat,
    },
  })
}
