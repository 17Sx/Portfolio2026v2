# Portfolio 17Sx

> Feel free to reuse or fork this repo. If you do, a mention or link back is appreciated.

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/17Sx/Portfolio2026v2.git
```

1. Enter the project directory

```bash
cd Portfolio2026v2
```

1. Install dependencies

```bash
npm install
```

1. Start the development server

```bash
npm run dev
```

The site runs on `http://localhost:5173`.

## Banner video

The looping banner (`public/banner/wanderer-{light,dark}.mp4` and their posters) is rendered procedurally. Tweak `scripts/banner/render.mjs`, then regenerate with `npm run banner:render` (requires `ffmpeg` with libx264).

## Music section (Deezer)

The Music section on the home page shows my most played artists and my top track, pulled live from Deezer's public API by `api/deezer.ts` (also served by `npm run dev` through a small Vite plugin). It defaults to my profile; if you fork the repo, set `DEEZER_USER_ID` (the number in `https://www.deezer.com/profile/<id>`) in the Vercel project environment, and keep that Deezer profile public. `npm test` runs the handler tests in `tests/` (Node 22.18+).

## Analytics (stats.17sx.me)

The portfolio ships its own cookie-free analytics. `src/analytics/tracker.ts` sends beacons to `api/collect.ts`, which aggregates them in Upstash Redis; the dashboard (`src/stats`) is served when the site is opened on a `stats.*` host and reads `api/stats.ts`.

What is measured: pageviews, unique visitors (HyperLogLog over a hash of IP + user agent salted per day, the IP is never stored), sessions, bounce rate, engaged time, scroll depth, geo (country, city, coordinates from Vercel edge headers), referrers, UTM tags, navigation flows, outbound clicks, browser / OS / device / screen / hardware / preferences, Core Web Vitals (LCP, INP, CLS, FCP, TTFB), filtered bots and a live log.

Setup:

1. Add an Upstash Redis database to the Vercel project (Storage → Upstash). It exposes `KV_REST_API_URL` and `KV_REST_API_TOKEN` (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` work too). Optionally set `STATS_SALT` to a random string.
2. Add the `stats.17sx.me` domain to the same Vercel project. Nothing else: the SPA switches on the hostname.
3. Exclude your own browser by opening `https://17sx.me/?notrack=1` once (`?notrack=0` to undo).

Without Redis the collector is a silent no-op and the dashboard explains what is missing.

Locally, `npm run dev` serves `api/` and loads `.env.local`. A local Redis speaking the Upstash REST API:

```bash
docker network create stats-net
docker run -d --name stats-redis --network stats-net redis:7-alpine
docker run -d --name stats-srh --network stats-net -p 8079:80 \
  -e SRH_MODE=env -e SRH_TOKEN=devtoken -e SRH_CONNECTION_STRING=redis://stats-redis:6379 \
  hiett/serverless-redis-http
printf 'KV_REST_API_URL=http://localhost:8079\nKV_REST_API_TOKEN=devtoken\n' > .env.local
```

Browse `http://localhost:5173` to generate hits, then open `http://stats.localhost:5173`. The analytics unit tests run with vitest as part of `npm test` (the API modules use `.js` import specifiers for the Vercel runtime, which plain `node --test` cannot resolve). The world map is generated from Natural Earth data: `node scripts/world-map.mjs path/to/world-atlas/land-110m.json > src/stats/worldMap.ts`.

## License

Reuse is welcome; a mention or link back is appreciated.
