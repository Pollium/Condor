# @condor/browser

The Condor SDK for the web. It captures pageviews (including single-page navigations), clicks with rage and dead-click
detection, JavaScript and network errors, Core Web Vitals, custom events and identified users, and it records sessions
with rrweb. Everything is sent to your own Condor collector.

## Install

With a script tag (served by your Condor install):

```html
<script defer src="https://condor.example.com/i/condor.js" data-key="ck_…" data-release="1.4.0"></script>
<script>
    window.condor = window.condor || [];
    condor.push(['identify', 'user-42', { email: 'ana@example.com' }]);
</script>
```

Calls pushed before the script loads are replayed once it does.

With npm:

```js
import { condor } from '@condor/browser';

condor.init({ key: 'ck_…', host: 'https://condor.example.com', release: '1.4.0' });
```

## API

| Call | What it does |
|---|---|
| `init({ key, host?, release?, autocapture?, recording?, respectDnt?, maskAllInputs?, debug? })` | starts tracking; `host` defaults to the page origin (or the script origin for the snippet) |
| `track(name, props?)` | a custom event; a numeric `props.value` is summed as revenue |
| `identify(userId, traits?)` | links the visitor to your user; `traits.name` and `traits.email` show up in the console |
| `page()` | records a pageview by hand (SPA navigations are automatic) |
| `reset()` | forgets the user and starts a new anonymous visitor (call it on sign-out) |
| `optOut()` / `optIn()` | stops and resumes all tracking for this browser |
| `flush()` | sends what is queued now |
| `sessionId()`, `anonymousId()` | the current ids |

Recording, sampling, masking and network/console capture are configured per app in the console and fetched at start-up.
The options passed to `init` can only make them stricter.

## Privacy

- Every input is masked by default. Add `data-condor-mask` to hide an element's text from click labels and recordings,
  `data-condor-block` (or a selector in the app's settings) to leave an element out of recordings entirely.
- Query strings are dropped from captured network requests, and requests to the Condor host are never captured.
- With *Respetar Do Not Track* on, browsers sending `DNT: 1` are not tracked at all.

## From a server

Any backend can send events with the same public key:

```bash
curl -X POST https://condor.example.com/i/batch \
  -H 'content-type: application/json' \
  -d '{
    "key": "ck_…",
    "sdk": { "name": "http", "version": "1" },
    "sentAt": 1761739200000,
    "anonymousId": "user-42",
    "userId": "user-42",
    "context": {},
    "events": [{ "type": "custom", "name": "invoice_paid", "id": "6f0d2c1e-8a4b-4c3d-9e2f-1a2b3c4d5e6f", "timestamp": 1761739200000, "path": "/api/invoices", "props": { "value": 120 } }]
  }'
```

`id` must be a uuid; resending the same id is ignored. Events without a `sessionId` count toward people and events but not
sessions.
