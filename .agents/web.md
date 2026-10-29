# Web (`packages/apps/web`)

React 19 + Vite + IBM Carbon (`@carbon/react`, `@carbon/icons-react`) + Tailwind v4 utilities, all copy in Spanish.

## Layout of `src/`

```
app/                    composition root: router.tsx, routes.ts (folder discovery), layouts/ConsoleLayout, layouts/Sidebar
modules/<name>/         api/api.ts (calls), components/<Name>/index.tsx, hooks/use-*.ts, pages/{guest,protected}/**/index.tsx, utils/*.ts
shared/                 never imports app/ or modules/
    components/         Page (PageHeader, Section, Stack, Legend), RowList, ShareList, StatTile (+ StatRow), Segmented, ToolbarMenu,
                        Code, Modal, ActionMenu, EmptyState, WorldMap, Charts (BarsChart, TrendChart, SessionsChart, WeekHeatmap, Sparkline)
    store/              period.ts (usePeriodStore: '24h'|'7d'|'30d'|'90d'), toolbar.ts (portal target for PageHeader)
    utils/              format.ts (fmt.n/k/pct/clock/duration/signed/ago/day/time), error-copy.ts, views.ts, chart-style.ts, heat.ts
```

- A page file is `modules/<m>/pages/protected/[projectId]/<segment>/index.tsx`; `[x]` becomes `:x`. Pages render inside the
  console layout, which provides the project context: `useProject()` / `useWorkspace()` from `@/modules/projects/hooks/use-workspace`.
- `PageHeader` portals the title, hint and toolbar controls into the sticky toolbar. Put page-level controls (ToolbarMenu, Segmented,
  Search) as its children.
- Data: `call(route, { path, query })` from `@condor/ui/api/call` inside the module's `api/api.ts`; read it with
  `useQuery(api.fn, [arg1, arg2])` (`@condor/ui/hooks/api/use-query` — an `undefined` arg keeps it idle; it returns
  `{ data, loading, error, reload }`) and write with `useMutation(api.fn)` (`run(...)`, `loading`, `error`). Route tables and
  wire types come from `@condor/contracts/<domain>/**`. Never hard-code a URL, never fake data.
- Live: `useLive(projectId, onSession?)` from `@/modules/live/hooks/use-live` (count, pages, and `live.session` frames).
- Roles: `useMe()` / `canEdit(user)` from `@/modules/auth/hooks/use-me`; viewers see everything read-only.
- Errors to copy: `errorCopy({...})(error)` from `@/shared/utils/error-copy`.
- Style: 4 spaces, single quotes, semicolons, `if(`/`}else{` with no space, `interface Name{`, `@/` imports (no relative imports),
  kebab-case file names except `Component/index.tsx`, no comments, no `!important`.
- Carbon BEM selectors contain `__`, which Tailwind arbitrary variants turn into spaces — put such overrides as plain CSS classes in
  `src/assets/styles/index.css` (`@layer components`).

## Checking your work

- `npx tsc -b` (also builds `packages/shared/{contracts,ui}` declarations), `npx oxlint --deny-warnings`, `npx vite build`.
- The dev stack: the api on :4100 and the web dev server on :5190, which proxies `/api` (stripped, with the websocket) and `/i`
  (kept) to it.
  `node scripts/shot.mjs <path> <out.png> [light|dark] [width] [height]` (from the repo root) signs in with the dev owner token and
  screenshots a page, printing `ok` or the page/console errors. The seeded project is
  `01a186ac-50ed-7505-bf0c-285c07eafb0f` ("Tienda Andes", 90 days of synthetic data).
