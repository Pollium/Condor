# Web (`packages/apps/web`)

React 19 + Vite + IBM Carbon (`@carbon/react`, `@carbon/icons-react`) + Tailwind v4 utilities, with every word of copy in
Spanish, English and Portuguese, on [`@pollium/readable-react`](../packages/apps/web/node_modules/@pollium/readable-react/AGENTS.md).
Read that guide first: it holds pages, queries, mutations, the session, gateways and error copy. This file holds only
what is Condor's.

## Layout of `src/`

```
main.tsx                mount({ name: 'condor', pages, layout: ConsoleLayout, signIn: '/entrar', copy: appCopy })
app/                    layouts/ConsoleLayout (the frame of every signed-in page), layouts/Sidebar, i18n/
modules/<name>/         components/<Name>/index.tsx, hooks/use-*.ts, pages/{guest,protected}/**/index.tsx, utils/*.ts, i18n/
shared/                 never imports app/ or modules/
    components/         Page (PageHeader, Section, Stack, Legend), RowList, ShareList, StatTile (+ StatRow), Segmented, ToolbarMenu,
                        Code, Modal, ActionMenu, EmptyState, WorldMap, Charts (BarsChart, TrendChart, SessionsChart, WeekHeatmap, Sparkline)
    store/              period.ts (usePeriodStore: '24h'|'7d'|'30d'|'90d'), segment.ts, toolbar.ts (portal target for PageHeader),
                        theme.ts (useThemeStore and initTheme: Carbon's cds--g100 / cds--white on <html>, saved as condor.theme)
    utils/              format.ts (fmt.n/k/pct/clock/duration/signed/ago/day/time), error-copy.ts (appCopy, authFallback),
                        env.ts (env.ingestUrl, the origin the SDK snippets and the test event post to), views.ts, chart-style.ts, heat.ts
    i18n/               locale.ts (locale, intlLocale, pick, switchLocale, initLocale) and the shared words (views, close, copy, errors, Carbon ids)
```

- A page file is `modules/<m>/pages/protected/[projectId]/<segment>/index.tsx`; `[x]` becomes `:x`. Route segments stay
  Spanish (`/entrar`, `/configurar`, `/invitacion/:token`, `/cuenta`, `/equipo`, `/:projectId/sesiones`…); they are ids,
  not copy. Pages render inside the console layout, which provides the project context: `useProject()` / `useWorkspace()`
  from `@/modules/projects/hooks/use-workspace`.
- `PageHeader` portals the title, hint and toolbar controls into the sticky toolbar. Put page-level controls (ToolbarMenu, Segmented,
  Search) as its children.
- Data: components pass the contract endpoint straight to the hooks, `useQuery(issueRoutes.list, { path: { projectId }, query })`
  and `useMutation(issueRoutes.update, { path: { projectId, issueId } })`. There is no `api.ts`. A mutation refreshes the
  queries on its branch of the path; never call `reload()` after one. `reload()` is for a retry or "check again" button.
  `reload` and `set` are new on every render, so never put them in an effect's dependencies: the connection screen refreshes
  the project list with `invalidate(projectRoutes.list)` instead. Route tables, error tables and wire types come from
  `@condor/contracts/<domain>/**`. Never hard-code a URL, never fake data.
- Live: `useLive(projectId, onSession?)` from `@/modules/live/hooks/use-live` joins `liveGateway` from
  `@condor/contracts/live/gateway` with `useChannel` and answers the project's snapshot (count, pages); `live.session` frames go to
  `onSession`.
- Session: `session.start(token)` on sign-in, setup and accepted invitations, `session.end()` on sign-out, `useSession()` to render
  on it. The token is kept as `condor.session`.
- Roles: `useMe()` / `canEdit(user)` from `@/modules/auth/hooks/use-me`; viewers see everything read-only.
- Copy: never write a user-visible string in a component. Each module (and `app/`, `shared/`) owns `i18n/es.ts` (the source,
  a plain object), `en.ts` and `pt.ts` (typed `typeof es`, so a missing key fails `tsc`) and `index.ts`
  (`export const copy = pick({ es, en, pt })`). Read it as `copy.section.key`; interpolation and plurals are typed functions
  in the dictionary. Format with `fmt` or with `Intl` on `intlLocale` from `@/shared/i18n/locale`, never a hard-coded locale.
  The locale comes from `?lang=`, then the saved choice (`condor.locale`), then the browser. Switching it reloads the page, so
  module-level constants may read `copy`.
- Errors to copy: a module describes its contract's error table with `copyFor(Table, { ... })` in `utils/<module>-error.ts`,
  with the words taken from its `copy` (`issueError`, `funnelError`, `sessionError`, `teamError`, `accountError`, `authError`).
  An `AuthErrors` table spreads `authFallback` and names only the causes the module has words for. An error no table names
  falls to `appCopy`, which `mount` receives: `describeError(error)` reads only that. Field errors are `error.fields` on
  readable-react's `ApiError`.
- Style: 4 spaces, single quotes, semicolons, `if(`/`}else{` with no space, `interface Name{`, `@/` imports (no relative imports),
  kebab-case file names except `Component/index.tsx`, no comments, no `!important`.
- Carbon BEM selectors contain `__`, which Tailwind arbitrary variants turn into spaces — put such overrides as plain CSS classes in
  `src/assets/styles/index.css` (`@layer components`).

## Checking your work

- `npx tsc -b`, `npx oxlint --deny-warnings`, `npx vite build`. `vite.config.ts` is `readableConfig(...)` with React, Tailwind,
  port 5190 and the `/i` proxy; `tsconfig.json` extends `@pollium/readable-react/tsconfig.json`.
- The dev stack: the api on :4100 and the web dev server on :5190, which proxies `/api` (stripped, with the websocket) and `/i`
  (kept) to it.
  `node scripts/shot.mjs <path> <out.png> [light|dark] [width] [height]` (from the repo root) signs in with the dev owner token and
  screenshots a page, printing `ok` or the page/console errors. The seeded project is
  `01a186ac-50ed-7505-bf0c-285c07eafb0f` ("Tienda Andes", 90 days of synthetic data).
