# Condor

![Condor: product analytics and session replay on your own server](/screenshots/cover.png)

Condor is self-hosted product analytics and session replay for any web app. One script tag gives
you pageviews, sessions, people, rage and dead clicks, JavaScript and network errors, Core Web
Vitals, custom events, funnels, journeys, retention, click and scroll heatmaps and full session
replays. It all runs on your own server and is stored in your own database.

```html
<script defer src="https://condor.example.com/i/condor.js" data-key="ck_…"></script>
```

- [Deploy Condor](#deploy-condor)
- [Using Condor](#using-condor)
- [Configuration](#configuration)
- [Where the data lives](#where-the-data-lives)
- [Develop](#develop)

## Deploy Condor

You need a Linux host with Docker and the Compose plugin.

```bash
git clone https://github.com/Pollium/Condor
cd Condor
cp .env.example .env
sed -i "s|^CONDOR_JWT_SECRET=.*|CONDOR_JWT_SECRET=$(openssl rand -hex 32)|; \
        s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 16)|; \
        s|^STORAGE_SECRET_KEY=.*|STORAGE_SECRET_KEY=$(openssl rand -hex 16)|" .env
docker compose up -d --build
```

Compose starts five containers:

| Service | Role |
|---|---|
| `web` | nginx with the console, and the only service with a published port. It routes `/` to the console and `/api` and `/i` to the api. |
| `api` | accounts and members, the collector the SDK posts to, the workers that write sessions, people, events and errors, every query the console runs, and the live channel |
| `postgres` 18 | apps, users, sessions, people, events and errors |
| `redis` 7 | the ingest queues and the pub/sub between api replicas |
| `storage` | [RustFS](https://github.com/rustfs/rustfs), an S3-compatible store for the replay chunks. Condor creates the bucket the first time it needs it. |

The console is at `http://localhost:8080`. Then:

1. Create the owner account. The first visit asks for it. After that the setup page is closed.
2. Add your first app (below) and paste its snippet into your site.
3. Invite your team from **Team**. Invitations are links you copy and send yourself, so no
   email server is needed.

To look around first, `docker compose exec api pnpm seed` loads a demo store, *Tienda Andes*,
with 90 days of synthetic history. You can delete it later from its **Settings → Danger zone**.

The schema is synced on boot, so updating is:

```bash
git pull && docker compose up -d --build
```

### On a public server

Your sites load `condor.js` and post their events to this origin. A site served over HTTPS
therefore needs Condor on HTTPS as well. Put the reverse proxy you already run in front of port
8080. With NGINX:

```nginx
server {
    listen 80;
    server_name condor.example.com;
    client_max_body_size 6m;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 1h;
    }
}
```

`certbot --nginx -d condor.example.com` adds the certificate. Then in `.env`:

```bash
CONDOR_PORT=127.0.0.1:8080
```

and `docker compose up -d`. Port 8080 is now reachable only by the proxy. Three lines in the
proxy config matter:

- `client_max_body_size` keeps replay chunks from being rejected at the default 1 MB.
- `X-Forwarded-For` carries the visitor's address, which places them on the map.
- `Upgrade` carries the websocket behind the live counters.

No URL is compiled into the console. The console, the api and the collector all use the origin
the browser sees, so moving to a new domain needs no rebuild.

### Countries and cities

Condor gets a visitor's country and city from one of two sources:

- **A GeoIP database.** Download a free City database in `.mmdb` format, such as DB-IP City Lite
  or MaxMind GeoLite2 City, into `./geoip/`. Then set `GEOIP_DATABASE=/geoip/<file>.mmdb`.
- **Proxy headers.** Behind Cloudflare or Vercel, set `TRUST_GEO_HEADERS=true` to read their
  country and city headers.

The IP address is used for the lookup and never stored.

### Locked out

`docker compose exec api pnpm set-password you@example.com 'new password'` resets any member's
password, the owner's included.

## Using Condor

Condor is organized around apps. Each app has its own public key, settings and data. You switch
between apps from the header, along with the period (24 hours, 7, 30 or 90 days), the global search
across people, pages and errors, and the light or dark theme. The console speaks English, Spanish
and Portuguese. It follows the browser's language, and **Your account → Language** changes it for that browser.

Members are **owners** (members and everything else), **admins** (apps, settings and errors) or
**viewers** (read only).

### Connect an app

**Add an app** in the app menu takes a name, a domain and where the data comes from: a web
app or a server/HTTP API. The app's **Settings** page then shows its key and install snippet. It
also shows whether the first event has arrived.

![App settings: public key, install snippet, name, domain, time zone and privacy](/screenshots/settings.png)

Paste the snippet before `</head>`, or install the SDK from npm:

```js
import { condor } from '@condor/browser';

condor.init({ key: 'ck_…', host: 'https://condor.example.com', release: '1.4.0' });
condor.identify(user.id, { email: user.email, name: user.name });
condor.track('purchase_completed', { value: 129990 });
```

Single-page apps are tracked on every history change. Node backends can send `track` and
`identify` with `@condor/node`, and their events join the user's live browser session when there
is one. Any other backend can `POST /i/batch` with the same key. [packages/sdk/browser/README.md](packages/sdk/browser/README.md) has the full API and the
server format.

The console adapts to the data each app sends. Paths, custom events, funnels, releases and the
conversion event all come from the app, and nothing is hard-coded.

### Overview

![Overview: where visitors are, people, sessions, duration, bounce, frustrated sessions and JS errors](/screenshots/overview.png)

**Overview** puts the period next to the one before it. It shows where visitors are on a map with
countries, cities and languages, then sessions, people, duration, bounce rate, frustrated sessions
and JavaScript errors, each with its trend. Below that are breakdowns by channel, source,
campaign, page, entry and exit page, release, device, OS, browser, screen,
connection, visit frequency, duration and scroll depth. The header counts the visitors on the site
right now.

### Sessions and replays

![Sessions: every visit with its person, place, device, activity and frustration signals](/screenshots/sessions.png)

**Sessions** lists every visit with its person, place, device, pages, activity and what went
wrong. You can search by person, email or page, and filter to recorded, converted, identified or
frustrated sessions, or to sessions with errors, rage clicks or dead clicks.

![Session replay with its timeline of pages, clicks, Web Vitals, custom events and errors](/screenshots/replay.png)

Opening a session plays its recording. Next to it are the session's **Events** (pages, clicks,
Web Vitals, custom events, identification and errors), its **Console**, its **Network** requests
and the **Person** behind it. Marks on the timeline show where things happened, and clicking an
event seeks the replay to it. **Copy link** shares the session with a teammate.

### Events

![Events: every custom event with its count, people, trend and property values](/screenshots/events.png)

**Events** lists every custom event of the period with how many times it was sent and by how many
people. Selecting one shows its total against the previous period, how often each person sends it,
its trend over time, and the values of each of its properties.

The **Everyone** menu on Sessions, Events, Funnels and Retention narrows any of them to the people
who carry one trait, such as `plan: pro`, taken from what `identify` sent.

### Heatmaps

![Click heatmap over a product page, with the most clicked elements](/screenshots/heatmaps.png)

**Heatmaps** draws clicks, rage clicks or scroll depth over a real snapshot of the page, per
path group and per device (desktop, tablet or mobile). Beside it are the most clicked elements.

### Funnels

![Funnel: people at each step, drop-off, median time and conversion by device](/screenshots/funnels.png)

**Funnels** chains pages and custom events into steps within a window of 1 hour to 30 days. For
each step it shows how many people get there, how many drop off and the median time between steps.
It also breaks conversion down by device.

### Journeys

![Journeys: the flow between pages from the entry page, with exits](/screenshots/journeys.png)

**Journeys** follows sessions page by page from any entry page or from one you pick, for 3 to 6
steps, with or without exits. Below the flow are the most common full paths.

### Retention

![Retention: the curve and the weekly cohorts](/screenshots/retention.png)

**Retention** groups people by the day or week of their first visit and shows how many come back,
as a curve and as a cohort table. A return can be any visit or a specific custom event.

### Errors

![Errors grouped by message, with occurrences, sessions, people and the trace](/screenshots/errors.png)

**Errors** groups JavaScript and network errors by type, message and top stack frame. Ids,
numbers, URLs, line numbers and build hashes are ignored, so one bug stays one group across
deploys. Each group shows its occurrences, sessions, people, release, the last 24 hours and the
trace. **View a session** opens a
replay where it happened. Errors can be resolved or ignored. A resolved error reopens if it comes
back.

### Privacy, recording and retention

![Recording, network and console capture, route groups and conversion](/screenshots/recording.png)

Each app's **Settings** controls:

- **Privacy.** Inputs are masked by default, and you can also mask all text. You can respect
  Do Not Track and block selectors from recordings. In your own markup, `data-condor-mask` hides
  an element's text and `data-condor-block` leaves the element out entirely.
- **Recording.** Turn recording on or off, sample a share of sessions, and keep data for 30 days
  to 2 years. Metrics count every session; only recordings follow the sample. A daily job deletes
  events, sessions and replays past the window.
- **Network and console.** Capture network requests and console output next to the replay.
  `Authorization` and `Cookie` headers and query strings are never stored.
- **Group paths.** Merge dynamic paths such as `/productos/:slug` into one page. Ids, uuids and
  numbers are collapsed automatically.
- **Conversion.** Choose the custom event that marks a session as converted.

## Configuration

Everything is in `.env` at the repository root. Compose stops and names the variable if a
required secret is missing.

| Variable | Notes |
|---|---|
| `CONDOR_JWT_SECRET` | Signs sessions. Any long random string. Required. |
| `POSTGRES_PASSWORD` | The `condor` database user's password. Required. |
| `STORAGE_SECRET_KEY` | The object store's secret key. Required. |
| `STORAGE_ACCESS_KEY` | The object store's access key. `condor` by default. |
| `CONDOR_PORT` | Where the console is published. `8080` by default; `127.0.0.1:8080` behind your own proxy. |
| `GEOIP_DATABASE` | Path of a `.mmdb` City database inside the container, such as `/geoip/dbip-city-lite.mmdb`. |
| `TRUST_GEO_HEADERS` | `true` reads country and city from Cloudflare or Vercel headers. |

## Where the data lives

- **Postgres**: the `condor_postgres-data` volume. It holds apps, members, people, sessions,
  events and errors.
- **Replays**: the `condor_storage-data` volume, under
  `condor/replays/<app>/<session>/<seq>.json.gz`.
- **Queues**: the `condor_redis-data` volume, with append-only persistence, so events still
  queued survive a restart.

The collector never writes to the database. It validates the key, enriches each event (device,
place, path group, attribution), puts replay chunks in the object store and queues the rest. A
traffic spike therefore waits in Redis instead of holding database connections.

`docker compose exec postgres pg_dump -U condor condor > condor.sql` backs up everything except
the recordings. Copy the `condor_storage-data` volume to keep those as well.

## Develop

```bash
pnpm install
pnpm infra                                # Postgres :5442, Redis :6389, S3 :9010
pnpm --filter @condor/browser build       # condor.js, which the api serves
pnpm dev                                  # api :4100, web :5190
pnpm --filter @condor/api seed            # the demo store
```

[AGENTS.md](AGENTS.md) explains the architecture and the conventions: module discovery by folder,
contracts-first wire types and the checks every change passes (`pnpm typecheck`, `pnpm lint`,
`pnpm test`).

### Limits worth knowing

- The schema is kept in sync with `synchronize` on boot. There are no migrations yet.
- Analytics run on Postgres, which comfortably handles a few million events a month per app. The
  event store sits behind its own module if you need a columnar store later.
- The SDK covers the web. Mobile apps and servers can send events through the HTTP API, without
  replays.
