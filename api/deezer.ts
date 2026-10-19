import type { VercelRequest, VercelResponse } from '@vercel/node'

// Profil Deezer public de Noa ; surchargeable par DEEZER_USER_ID pour un fork
const USER_ID = process.env.DEEZER_USER_ID || '1809986862'
const ARTIST_LIMIT = 15

type DeezerArtist = { id: number; name: string; link: string; picture_small: string }
type DeezerTrack = { id: number; title: string; artist: { name: string } }
type DeezerList<T> = { data?: T[]; total?: number; error?: unknown }

async function getList<T>(path: string): Promise<DeezerList<T>> {
  const response = await fetch(`https://api.deezer.com/user/${USER_ID}/${path}`)
  if (!response.ok) throw new Error(`Deezer ${path}: HTTP ${response.status}`)
  const body = (await response.json()) as DeezerList<T>
  // Deezer renvoie ses erreurs (profil privé, id inconnu) en HTTP 200
  if (body.error || !Array.isArray(body.data)) throw new Error(`Deezer ${path}: invalid response`)
  return body
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (!/^\d+$/.test(USER_ID)) {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ music: null })
    return
  }

  try {
    const [artists, tracks] = await Promise.all([
      getList<DeezerArtist>(`charts/artists?limit=${ARTIST_LIMIT}`),
      getList<DeezerTrack>('charts/tracks?limit=1'),
    ])
    const artistList = artists.data ?? []
    const topTrack = tracks.data?.[0]

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.json({
      music: {
        profileUrl: `https://www.deezer.com/profile/${USER_ID}`,
        artists: artistList.map((a) => ({
          id: a.id,
          name: a.name,
          link: a.link,
          picture: a.picture_small,
        })),
        moreCount: Math.max(0, (artists.total ?? artistList.length) - artistList.length),
        onRepeat: topTrack
          ? { id: topTrack.id, title: topTrack.title, artist: topTrack.artist.name }
          : null,
      },
    })
  } catch (error) {
    console.error(error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(502).json({ music: null })
  }
}
