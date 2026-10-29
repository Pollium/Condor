# Adding a module

A module is a folder under `src/modules/` — business features with HTTP, models, events or
queues. Create it, drop default-exported classes into the category folders, and the bootstrap
discovers everything — no registry to edit. This is the full recipe with a minimal working example.

## The category folders (all optional)

```
src/modules/<name>/
    controllers/   # default-export class extends BaseController → routes mounted at /<name>
    models/        # default-export TypeORM entity extends BaseModel → registered on the DataSource
    services/      # business logic (imported by controllers/events; NOT auto-discovered).
                   # May nest by concept (sessions/services/replay/, overview/services/breakdown/).
                   # Discovered folders — controllers/models/events/queues/gateways —
                   # stay flat: ModuleDiscovery readdir is not recursive.
    events/        # default-export @DefineEventGroup class → subscribed to the bus
    queues/        # default-export BaseQueue subclass → worker started at boot
    gateways/      # default-export BaseGateway subclass → WebSocket channel mounted at its @Channel path
    middlewares/   # module-owned guards, referenced via @Middleware (NOT auto-discovered)
    contracts/
        domain/    # internal types, event payloads (transport-agnostic; the web never sees these)
        http/      # request-body DTOs — only while the module is server-only; once the web
                   # consumes it, DTOs and wire shapes move to @condor/contracts/<module>
        types/     # .d.ts ambient augmentations (EventMap, FastifyRequest, …)
```

Only `controllers/`, `models/`, `events/`, `queues/`, `gateways/` are scanned, and only
their files' **default export** is picked up. `services/`, `middlewares/`, `contracts/` are ordinary
code imported by the discovered classes.

## Recipe: a `poll` module with one endpoint

**1. Entity** — `src/modules/poll/models/Poll.ts`. Extend `BaseModel` (gives `id`,
`createdAt`, `updatedAt`, `@Hidden`-aware `toJSON`). The class is the only declaration of its
columns; add `implements <Name>Profile` when the web edits it through a contracts type.

```ts
// src/modules/poll/models/Poll.ts
import { Entity, Column } from 'typeorm';
import BaseModel from '@/shared/models/BaseModel';

@Entity()
export default class Poll extends BaseModel{
    @Column('text') question!: string;
    @Column('integer') ownerId!: number;
}
```

**2. Request DTO** — `src/modules/poll/contracts/http/poll.ts`:

```ts
import Poll from '../../models/Poll';
export type CreatePollInput = Pick<Poll, 'question'>;
```

**3. Service** — `src/modules/poll/services/Poll.ts`. All business logic. Throw domain
error factories from `defineErrors` (declare them in `contracts/domain/errors.ts`).

```ts
import Poll from '../models/Poll';
import { CreatePollInput } from '../contracts/http/poll';

export default class PollService{
    create(ownerId: number, input: CreatePollInput): Promise<Poll>{
        return Poll.create({ question: input.question, ownerId }).save();
    }
}
```

**4. Controller** — `src/modules/poll/controllers/Poll.ts`. Default export, translates HTTP ↔
service and nothing more. It mounts at `/poll` because the folder is `poll`. Extend
`AuthenticatedController` when every route needs a signed-in user (it applies `AuthenticatedRoute`
to the whole class) and `BaseController` otherwise; use `@Status` for non-200 success. Handlers
declare their inputs with parameter decorators (`@CurrentUser`, `@Body`, `@NumericParam`, …) rather
than touching `req` — see conventions.md.

```ts
import AuthenticatedController from '@readable/auth/AuthenticatedController';
import { Route } from '@/shared/controllers/Route';
import { Status } from '@/shared/controllers/Status';
import { Body } from '@/shared/controllers/RequestParams';
import { CurrentUser } from '@/modules/auth/middlewares/CurrentUser';
import PollService from '../services/Poll';
import { CreatePollInput } from '../contracts/http/poll';

export default class PollController extends AuthenticatedController{
    #service = new PollService();

    @Route('/', 'POST')
    @Status(201)
    create(@CurrentUser() userId: number, @Body() body: CreatePollInput){
        return this.#service.create(userId, body);
    }
}
```

**5. Run it.** No registration step. `pnpm typecheck`, then `pnpm start` — `POST /poll`
exists and returns `201 { data: <poll> }`. Done.

## Conventions the example encodes

- **Return raw domain data** from handlers (`Poll`, arrays, objects). The base class wraps it
  as `{ data: ... }`. Return nothing → `204`. Never build the envelope yourself. (conventions.md)
- **`@CurrentUser() userId: number`** injects the authenticated user id, set by
  `AuthenticatedRoute`. It only works on routes guarded by that middleware, which
  `AuthenticatedController` applies to every route. Path ids come from
  `@NumericParam('id')`, the body from `@Body()` — handlers never read `req` directly.
  (conventions.md → Parameter decorators)
- **Contracts split**: event payloads, query filters and views that extend an entity in `domain/`
  (the entity class is the only declaration of its columns); request bodies in `http/` while the
  module is server-only, in `@condor/contracts/<module>` once the web consumes it (see
  conventions.md rule 3). Reuse existing contracts before adding new ones.

## If your module needs events or queues

- Reacting to something happening elsewhere (e.g. `user.created`)? Add an `events/` group → **events.md**.
- Doing slow/retryable background work (email, external calls)? Add a `queues/` class → **queues.md**.

The `user` module is the fullest real example: two controllers (`/user/me`, `/user/me/settings`),
a `user.created` event group that provisions settings, models with a `@OneToOne` relation, and
the full contracts split. Read it when in doubt.

## Anti-patterns (do NOT do these)

- **No `index.ts` / registry / `ModuleDefinition`** per module. Discovery is by folder.
- **No business logic in controllers** — delegate to a service.
- **No hand-rolled authorization prologues** — role/membership route gates ("is a member",
  "is an admin") are self-contained `middlewares/` guards, not `requireX` service methods;
  ownership of the entity a route addresses is `getOwned(userId, id)` on the service, resolved
  at the edge by the `@Owned(Service)` decorator. See conventions.md.
- **No `throw new Error`** — throw a domain error factory from `defineErrors`.
- **No importing a module's types into `shared/`** — augment a global interface instead.
- **No reading `process.env` directly** — add the key to `@/shared/config` and read it there.
