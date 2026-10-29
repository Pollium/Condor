import Funnel from '@/modules/funnels/models/Funnel';
import Issue from '@/modules/issues/models/Issue';
import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import Event from '@/modules/tracking/models/Event';
import User from '@/modules/users/models/User';
import PasswordService from '@readable/auth/PasswordService';
import { Role } from '@condor/contracts/auth/domain';
import { DEFAULT_SETTINGS } from '@/modules/projects/services/ProjectSettings';
import { randomBytes, randomUUID } from 'node:crypto';

export { DEFAULT_SETTINGS };

export const SEED_PASSWORD = 'seed-password-123';

export const minutesAgo = (minutes: number): Date => new Date(Date.now() - minutes * 60_000);

export class Seed{
    static #sequence = 0;
    #password = new PasswordService();

    async user(role: Role = 'viewer'): Promise<User>{
        const n = ++Seed.#sequence;

        return User.create({
            email: `member${n}@condor.test`,
            name: `Member ${n}`,
            role,
            passwordHash: await this.#password.hash(SEED_PASSWORD),
            lastSignInAt: null
        }).save();
    }

    project(overrides: Partial<Project> = {}): Promise<Project>{
        return Object.assign(Project.create({
            name: 'Tienda Andes',
            host: 'tiendaandes.test',
            platform: 'web',
            tint: '#0f62fe',
            publicKey: `ck_${randomBytes(12).toString('hex')}`,
            lastEventAt: null
        }), overrides, { settings: { ...DEFAULT_SETTINGS, ...overrides.settings } }).save();
    }

    person(project: Project, overrides: Partial<Person> = {}): Promise<Person>{
        const seenAt = overrides.firstSeenAt ?? minutesAgo(60);
        return Object.assign(Person.create({
            projectId: project.id,
            anonymousId: `anon_${randomBytes(6).toString('hex')}`,
            userId: null,
            name: null,
            email: null,
            traits: {},
            firstSeenAt: seenAt,
            lastSeenAt: seenAt,
            sessions: 1
        }), overrides).save();
    }

    session(project: Project, person: Person, overrides: Partial<Session> = {}): Promise<Session>{
        const startedAt = overrides.startedAt ?? minutesAgo(30);
        const duration = overrides.duration ?? 120;
        return Object.assign(Session.create({
            id: randomUUID(),
            projectId: project.id,
            personId: person.id,
            personKey: person.userId ?? person.anonymousId,
            anonymousId: person.anonymousId,
            userId: person.userId,
            startedAt,
            endedAt: new Date(startedAt.getTime() + duration * 1000),
            duration,
            activeDuration: Math.round(duration * 0.7),
            pageviews: 1,
            events: 1,
            entryPath: '/',
            exitPath: '/',
            channel: 'direct',
            device: 'desktop',
            country: 'CL',
            city: 'Santiago',
            os: 'macOS',
            browser: 'Chrome',
            sdk: 'condor-browser'
        }), overrides).save();
    }

    event(session: Session, overrides: Partial<Event> = {}): Promise<Event>{
        return Object.assign(Event.create({
            id: randomUUID(),
            projectId: session.projectId,
            sessionId: session.id,
            personId: session.personId,
            type: 'pageview',
            name: null,
            path: '/',
            rawPath: '/',
            title: null,
            timestamp: session.startedAt,
            device: session.device,
            release: session.release,
            props: null
        }), overrides).save();
    }

    issue(project: Project, overrides: Partial<Issue> = {}): Promise<Issue>{
        const seenAt = overrides.lastSeenAt ?? minutesAgo(10);
        return Object.assign(Issue.create({
            projectId: project.id,
            fingerprint: randomBytes(10).toString('hex'),
            errorType: 'TypeError',
            message: "Cannot read properties of undefined (reading 'price')",
            source: 'cart.ts:42:13',
            stack: null,
            status: 'open',
            occurrences: 1,
            firstSeenAt: overrides.firstSeenAt ?? seenAt,
            lastSeenAt: seenAt,
            firstRelease: null,
            lastRelease: null,
            resolvedAt: null,
            regressedAt: null
        }), overrides).save();
    }

    funnel(project: Project, overrides: Partial<Funnel> = {}): Promise<Funnel>{
        return Object.assign(Funnel.create({
            projectId: project.id,
            name: 'Compra',
            steps: [
                { kind: 'page', match: '/productos/:slug', label: 'Ve un producto' },
                { kind: 'event', match: 'add_to_cart', label: 'Añade al carrito' },
                { kind: 'event', match: 'purchase_completed', label: 'Compra' }
            ],
            windowHours: 24
        }), overrides).save();
    }
}

export const seed = new Seed();
