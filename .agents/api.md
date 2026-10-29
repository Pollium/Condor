# The api

`packages/apps/api` is the only backend. It owns every table, signs every session, collects what the SDK sends, runs the
workers and answers every question the web asks. Read [../AGENTS.md](../AGENTS.md) first for the data flow.

## Modules

| Module | What it does |
|---|---|
| `users`, `auth`, `members` | accounts: first-run owner setup, sign-in, profile, members with roles, invitations by link |
| `collect` | the public collector under `/i/`: validates the project key, enriches every event (device, place, path groups, attribution), stores replay chunks in S3, enqueues the batch, serves `condor.js` and the remote config |
| `tracking` | the workers that turn a queued batch into sessions, people, events and grouped errors, index replay chunks and enforce retention |
| `projects` | apps, their public keys and settings |
| `sessions`, `overview`, `heatmaps`, `funnels`, `journeys`, `retention`, `issues`, `search` | the queries behind each web page |
| `live` | the `/live` websocket: people online and live sessions per project |

Modules talk to each other through services, models and `eventBus`, never over HTTP.

## Data model

| Entity | Module | What one row is |
|---|---|---|
| `User` | `users` | a member of this Condor install, with a `role`: `owner` (members + everything), `admin` (apps, settings, issues), `viewer` (read only) |
| `Invitation` | `members` | a pending invitation link |
| `Project` | `projects` | an app sending data; `publicKey` (`ck_…`) is what the SDK presents; `settings` is `ProjectSettings` (jsonb) including the `timezone` every bucket is cut in |
| `Person` | `sessions` | one browser identity (`anonymousId`), optionally identified (`userId`, `name`, `email`, `traits`) |
| `Session` | `sessions` | one visit; `id` is the uuid the SDK generated. Counters (`pageviews`, `clicks`, `rageClicks`, `deadClicks`, `errors`, `uturns`), attribution (`channel`, `source`, `utm*`), place, device, `entryPath`/`exitPath`, `sequence` (nth visit of that person), `converted`, `hasReplay`. `personKey` = `userId ?? anonymousId`, so "people" is `COUNT(DISTINCT "personKey")` without a join |
| `ReplayChunk` | `sessions` | one gzipped rrweb chunk in S3 (`storageKey` from `replayStorageKey`) |
| `Event` | `tracking` | one tracked thing; `id` is the SDK's event id so a retried batch inserts nothing twice (`orIgnore`). `type` is `EventType`; `name` is the custom event name, the vital name, or the issue id for `error` events; `path` is normalized, `rawPath` is what the browser had; clicks carry `x` (0–1 of document width), `y` (px), `viewportWidth`, `documentHeight`, `selector`, `text`, `rage`, `dead`; `value` is the vital value or the purchase value |
| `Issue` | `issues` | one grouped error (`fingerprint` unique per project) with `status` open/resolved/ignored, `regressedAt` when a resolved issue comes back |
| `Funnel` | `funnels` | a saved funnel definition |

Timestamps are `timestamptz`. Bucket in the project's timezone with
`date_trunc($grain, "timestamp" AT TIME ZONE $tz)` and get the window from
`resolveWindow` (`src/shared/time/period-window.ts`), which returns `from`, `to`, `previousFrom`
(the comparison window), `grain` and the local bucket labels. Always pass the timezone as a query
parameter, never interpolated.

## Collecting

- `collect` never writes a table. It turns a `WireBatch` into an `IngestBatchJob`
  (`src/modules/tracking/contracts/domain/queue.ts`) on the `condor-ingest-batch` queue, which
  `tracking` consumes. Replay chunks go to S3 first, then to `condor-ingest-replay`. A burst of
  traffic fills Redis, not Postgres connections.
- `ProjectDirectory` caches a key's project for a minute (an unknown key for ten seconds) and
  forgets it on `project.changed`, which `eventBus` carries to every api replica.
- The collector is the only public path: `publicPaths: ['/i/']` in `src/core/Application.ts`
  answers any origin there without credentials, and everything else only `CORS_ORIGIN`.
- The SDK posts `text/plain`, because `navigator.sendBeacon` and a no-preflight `fetch` cannot send
  `application/json` cross-origin; `src/core/json-body.ts` parses both as JSON.

## Access

- `@Middleware(MemberRoute)` — any signed-in member; `@Middleware(EditorRoute)` — owner/admin;
  `RoleRoute(...roles)` for anything else (`src/shared/access/role-route.ts`). Each one reads the
  caller's `User` row, so a removed member or a changed role applies on the next request.
- `@CurrentProject()` (`modules/projects/middlewares/CurrentProject.ts`) resolves `:projectId` to a
  `Project` or `Project::NotFound`.
- Routes come from contracts as absolute paths (`/projects/:projectId/...`), so those controllers use
  `@Controller('')`.

## Tests

`tests/Seed.ts` has factories (`seed.user/project/person/session/event/issue/funnel`, `minutesAgo`);
`tests/roles.ts` `actor(role)` creates a member with that role and returns its id, so
`request(app, route, { as: await actor('viewer') })` exercises the guards. Queue producers, BaseQueue
and rate limits are stubbed in `tests/setup.ts`; object storage is not — spy on `objectStorage` in the
suites that touch it.
