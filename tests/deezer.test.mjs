// Tests du handler api/deezer.ts, sans réseau : fetch est remplacé par des réponses Deezer simulées.
// Lancer avec `npm test` (Node ≥ 22.18, qui exécute le TypeScript du handler directement).
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

process.env.DEEZER_USER_ID = '1809986862'
const { default: handler } = await import('../api/deezer.ts')

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const ARTISTS = {
  data: [
    { id: 4448630, name: 'Maes', link: 'https://www.deezer.com/artist/4448630', picture_small: 'https://cdn-images.dzcdn.net/images/artist/a/56x56.jpg' },
    { id: 7, name: 'Evil', link: 'javascript:alert(1)', picture_small: 'javascript:alert(2)' },
    { id: 'bad', name: 3 },
  ],
  total: 20,
}
const TRACKS = { data: [{ id: 4260844891, title: 'asphyxie', artist: { name: 'Wallace Cleaver' } }] }

function mockDeezer({ artists = ARTISTS, tracks = TRACKS } = {}) {
  globalThis.fetch = async (url) => {
    const body = String(url).includes('charts/artists') ? artists : tracks
    if (body instanceof Error) throw body
    return new Response(JSON.stringify(body))
  }
}

async function call(req = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    location: undefined,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    redirect(code, location) {
      this.statusCode = code
      this.location = location
      return this
    },
    end() {
      return this
    },
  }
  await handler({ method: 'GET', url: '/api/deezer', ...req }, res)
  return res
}

test('rejects methods other than GET and HEAD', async () => {
  const res = await call({ method: 'POST' })
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.Allow, 'GET, HEAD')
})

test('redirects any query string to the cached canonical URL without calling Deezer', async () => {
  globalThis.fetch = () => assert.fail('Deezer must not be called')
  const res = await call({ url: '/api/deezer?cb=1' })
  assert.equal(res.statusCode, 308)
  assert.equal(res.location, '/api/deezer')
  assert.match(res.headers['Cache-Control'], /s-maxage=3600/)
})

test('returns charts with links rebuilt from ids and only CDN pictures', async () => {
  mockDeezer()
  const res = await call()
  assert.equal(res.statusCode, 200)
  assert.match(res.headers['Cache-Control'], /s-maxage=3600/)
  assert.deepEqual(res.body.music.artists, [
    { id: 4448630, name: 'Maes', link: 'https://www.deezer.com/artist/4448630', picture: 'https://cdn-images.dzcdn.net/images/artist/a/56x56.jpg' },
    { id: 7, name: 'Evil', link: 'https://www.deezer.com/artist/7', picture: null },
  ])
  assert.equal(res.body.music.moreCount, 18)
  assert.deepEqual(res.body.music.onRepeat, { id: 4260844891, title: 'asphyxie', artist: 'Wallace Cleaver' })
})

test('keeps the artists when the top-track call fails, with a short cache', async () => {
  mockDeezer({ tracks: new Error('tracks down') })
  const res = await call()
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.music.artists.length, 2)
  assert.equal(res.body.music.onRepeat, null)
  assert.match(res.headers['Cache-Control'], /s-maxage=300, stale-while-revalidate=60/)
})

test('serves a cacheable empty answer when both calls fail', async () => {
  mockDeezer({ artists: new Error('down'), tracks: { error: { type: 'DataException' } } })
  const res = await call()
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { music: null })
  assert.match(res.headers['Cache-Control'], /s-maxage=60/)
})

test('treats a valid but empty chart as data, not as a failure', async () => {
  mockDeezer({ artists: { data: [], total: 0 }, tracks: { data: [] } })
  const res = await call()
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body.music.artists, [])
  assert.equal(res.body.music.onRepeat, null)
  assert.match(res.headers['Cache-Control'], /s-maxage=3600/)
})
