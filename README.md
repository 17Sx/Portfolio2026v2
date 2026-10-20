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

The portfolio ships its own cookie-free analytics. `src/analytics/tracker.ts` sends beacons to `api/collect.ts`, which aggregates them in Postgres (Neon); the dashboard (`src/stats`) is served when the site is opened on a `stats.*` host and reads `api/stats.ts`.

What is measured: pageviews, unique visitors (distinct hashes of IP + user agent salted per day, the IP is never stored), sessions, bounce rate, engaged time, scroll depth, geo (country, city, coordinates from Vercel edge headers), referrers, UTM tags, navigation flows, outbound clicks, browser / OS / device / screen / hardware / preferences, Core Web Vitals (LCP, INP, CLS, FCP, TTFB), filtered bots and a live log.

Setup:

1. Create a Neon Postgres database from the Vercel project (Storage → Create database → Neon) and connect it to the project. It exposes `DATABASE_URL` (`POSTGRES_URL` works too). The tables are created on the first request. Optionally set `STATS_SALT` to a random string.
2. Add the `stats.17sx.me` domain to the same Vercel project. Nothing else: the SPA switches on the hostname.
3. Exclude your own browser by opening `https://17sx.me/?notrack=1` once (`?notrack=0` to undo).

Without a database the collector is a silent no-op and the dashboard explains what is missing.

Locally, `npm run dev` serves `api/` and loads `.env.local`. Any Postgres works:

```bash
docker run -d --name stats-postgres -p 5433:5432 -e POSTGRES_PASSWORD=dev postgres:17-alpine
printf 'DATABASE_URL=postgres://postgres:dev@localhost:5433/postgres\n' > .env.local  # hepha-allow-secret: throwaway local Docker password
```

Browse `http://localhost:5173` to generate hits, then open `http://stats.localhost:5173`. The analytics unit tests run with vitest as part of `npm test` (the API modules use `.js` import specifiers for the Vercel runtime, which plain `node --test` cannot resolve). The world map is generated from Natural Earth data: `node scripts/world-map.mjs path/to/world-atlas/land-110m.json > src/stats/worldMap.ts`.

## License

Reuse is welcome; a mention or link back is appreciated.
