import IngestBatchQueue from '../queues/IngestBatchQueue';
import Event from '../models/Event';
import Project from '@/modules/projects/models/Project';
import Person from '@/modules/sessions/models/Person';
import Session from '@/modules/sessions/models/Session';
import { eventBus } from '@readable/events/EventBus';
import { useApp } from '@tests/harness';
import { DEFAULT_SETTINGS } from '@tests/Seed';
import { secondsAgo, trackingSeed } from './TrackingSeed';
import { describe, expect, it, vi } from 'vitest';

describe('IngestBatchQueue', () => {
    useApp();

    it('opens a session for a first batch with the person, attribution, place and every counter', async () => {
        const project = await trackingSeed.project();
        const batch = trackingSeed.batch(project, [
            trackingSeed.pageview('/productos/:slug', secondsAgo(120), {
                rawPath: '/productos/poncho-alpaca',
                attribution: trackingSeed.attribution()
            }),
            trackingSeed.click('/productos/:slug', secondsAgo(110), { rage: true }),
            trackingSeed.click('/productos/:slug', secondsAgo(105), { dead: true }),
            trackingSeed.pageleave('/productos/:slug', secondsAgo(100), { activeMs: 14_600, scrollDepth: 0.8 }),
            trackingSeed.pageview('/carrito', secondsAgo(90), { uturn: true }),
            trackingSeed.pageleave('/carrito', secondsAgo(60), { activeMs: 10_000, scrollDepth: 0.4 })
        ]);

        await new IngestBatchQueue().process(batch);

        const person = await Person.findOneByOrFail({ projectId: project.id, anonymousId: batch.anonymousId });
        const session = await Session.findOneByOrFail({ id: batch.sessionId });
        expect(person).toMatchObject({ sessions: 1, userId: null });
        expect(session).toMatchObject({
            projectId: project.id,
            personId: person.id,
            personKey: batch.anonymousId,
            sequence: 1,
            duration: 60,
            pageviews: 2,
            events: 6,
            clicks: 2,
            rageClicks: 1,
            deadClicks: 1,
            uturns: 1,
            activeDuration: 25,
            entryPath: '/productos/:slug',
            exitPath: '/carrito',
            channel: 'paid',
            source: 'google',
            utmCampaign: 'cyber-andes',
            country: 'CL',
            city: 'Santiago',
            device: 'mobile',
            release: '2.4.0',
            sdk: 'condor-browser@0.1.0'
        });
        expect(session.scrollDepth).toBeCloseTo(0.8);
        expect(await Event.countBy({ sessionId: session.id, personId: person.id })).toBe(6);
        expect(await Event.findOneByOrFail({ id: batch.events[0].id })).toMatchObject({ rawPath: '/productos/poncho-alpaca', device: 'mobile' });
    });

    it('extends the session on later batches and numbers the person\'s next session', async () => {
        const project = await trackingSeed.project();
        const first = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(600))]);
        const queue = new IngestBatchQueue();
        await queue.process(first);

        await queue.process({ ...first, events: [trackingSeed.pageview('/ofertas', secondsAgo(300)), trackingSeed.click('/ofertas', secondsAgo(290))] });
        await queue.process({ ...first, events: [trackingSeed.pageview('/cuenta', secondsAgo(900))] });
        const next = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(10))], { anonymousId: first.anonymousId });
        await queue.process(next);

        expect(await Session.findOneByOrFail({ id: first.sessionId })).toMatchObject({
            pageviews: 3,
            clicks: 1,
            duration: 610,
            entryPath: '/',
            exitPath: '/ofertas'
        });
        expect(await Session.findOneByOrFail({ id: next.sessionId })).toMatchObject({ sequence: 2 });
        expect(await Person.findOneByOrFail({ anonymousId: first.anonymousId })).toMatchObject({ sessions: 2 });
    });

    it('writes nothing twice when the same batch arrives again', async () => {
        const project = await trackingSeed.project();
        const batch = trackingSeed.batch(project, [
            trackingSeed.pageview('/', secondsAgo(60)),
            trackingSeed.click('/', secondsAgo(50))
        ]);
        const queue = new IngestBatchQueue();

        await queue.process(batch);
        await queue.process(batch);

        expect(await Event.countBy({ projectId: project.id })).toBe(2);
        expect(await Session.findOneByOrFail({ id: batch.sessionId })).toMatchObject({ pageviews: 1, clicks: 1, events: 2 });
        expect(await Person.findOneByOrFail({ anonymousId: batch.anonymousId })).toMatchObject({ sessions: 1 });
    });

    it('keeps every counter when batches of one session are processed concurrently', async () => {
        const project = await trackingSeed.project();
        const first = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(120))]);
        const queue = new IngestBatchQueue();
        const clicks = Array.from({ length: 6 }, (_, index) => ({
            ...first,
            events: [trackingSeed.click('/', secondsAgo(100 - index)), trackingSeed.click('/', secondsAgo(99 - index))]
        }));

        await Promise.all([queue.process(first), ...clicks.map((batch) => queue.process(batch))]);

        expect(await Session.findOneByOrFail({ id: first.sessionId })).toMatchObject({ clicks: 12, pageviews: 1, events: 13 });
    });

    it('links an identified person and moves their earlier sessions to the user', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const earlier = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(3600))]);
        await queue.process(earlier);

        const current = trackingSeed.batch(project, [
            trackingSeed.pageview('/cuenta', secondsAgo(30)),
            trackingSeed.identify('user-81', secondsAgo(20), { name: 'Camila Rojas', email: 'camila@correo.cl', plan: 'oro' })
        ], { anonymousId: earlier.anonymousId });
        await queue.process(current);

        expect(await Person.findOneByOrFail({ anonymousId: earlier.anonymousId })).toMatchObject({
            userId: 'user-81',
            name: 'Camila Rojas',
            email: 'camila@correo.cl',
            traits: { name: 'Camila Rojas', email: 'camila@correo.cl', plan: 'oro' }
        });
        const sessions = await Session.findBy({ anonymousId: earlier.anonymousId });
        expect(sessions.map((session) => session.personKey)).toEqual(['user-81', 'user-81']);
    });

    it('marks a session converted only by the project\'s conversion event', async () => {
        const project = await trackingSeed.project({ settings: { ...DEFAULT_SETTINGS, conversionEvent: 'purchase_completed' } });
        const queue = new IngestBatchQueue();
        const buyer = trackingSeed.batch(project, [trackingSeed.custom('purchase_completed', secondsAgo(30), { value: 45990 })]);
        const browser = trackingSeed.batch(project, [trackingSeed.custom('add_to_cart', secondsAgo(30))]);

        await queue.process(buyer);
        await queue.process(browser);

        expect(await Session.findOneByOrFail({ id: buyer.sessionId })).toMatchObject({ converted: true });
        expect(await Session.findOneByOrFail({ id: browser.sessionId })).toMatchObject({ converted: false });
        expect(await Event.findOneByOrFail({ id: buyer.events[0].id })).toMatchObject({ name: 'purchase_completed', value: 45990 });
    });

    it('only extends the session on a heartbeat and never opens one', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const opened = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(200))], { receivedAt: secondsAgo(200) });
        await queue.process(opened);

        await queue.process({ ...opened, events: [], receivedAt: secondsAgo(20) });
        await queue.process(trackingSeed.batch(project, []));

        expect(await Session.findOneByOrFail({ id: opened.sessionId })).toMatchObject({ duration: 180, events: 1 });
        expect(await Session.countBy({ projectId: project.id })).toBe(1);
        expect(await Event.countBy({ projectId: project.id })).toBe(1);
    });

    it('stores server events without a session', async () => {
        const project = await trackingSeed.project({ platform: 'server' });
        const batch = trackingSeed.serverBatch(project, [trackingSeed.custom('purchase_completed', secondsAgo(5), { value: 12990 })]);

        await new IngestBatchQueue().process(batch);

        expect(await Event.findOneByOrFail({ id: batch.events[0].id })).toMatchObject({ sessionId: null, value: 12990 });
        expect(await Session.countBy({ projectId: project.id })).toBe(0);
    });

    it('puts a server event for a signed-in user into the session they are browsing', async () => {
        const project = await trackingSeed.project({ settings: { ...DEFAULT_SETTINGS, conversionEvent: 'subscription_started' } });
        const queue = new IngestBatchQueue();
        const browsing = trackingSeed.batch(project, [
            trackingSeed.pageview('/settings/plan', secondsAgo(120)),
            trackingSeed.identify('user-81', secondsAgo(110), { name: 'Camila Rojas' })
        ]);
        await queue.process(browsing);

        const server = { ...trackingSeed.serverBatch(project, [trackingSeed.custom('subscription_started', secondsAgo(10), { value: 9990 })]), anonymousId: 'user-81', userId: 'user-81' };
        await queue.process(server);

        expect(await Event.findOneByOrFail({ id: server.events[0].id })).toMatchObject({ sessionId: browsing.sessionId });
        expect(await Session.findOneByOrFail({ id: browsing.sessionId })).toMatchObject({ events: 3, converted: true });
        expect(await Person.countBy({ projectId: project.id })).toBe(1);
    });

    it('keeps a server event out of a session the user left long ago', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const earlier = trackingSeed.batch(project, [
            trackingSeed.pageview('/', secondsAgo(7200)),
            trackingSeed.identify('user-81', secondsAgo(7190), {})
        ]);
        await queue.process(earlier);

        const server = { ...trackingSeed.serverBatch(project, [trackingSeed.custom('course_generated', secondsAgo(10))]), anonymousId: 'user-81', userId: 'user-81' };
        await queue.process(server);

        const event = await Event.findOneByOrFail({ id: server.events[0].id });
        expect(event.sessionId).toBeNull();
        expect(event.personId).toBe((await Person.findOneByOrFail({ anonymousId: earlier.anonymousId })).id);
        expect(await Session.countBy({ projectId: project.id })).toBe(1);
    });

    it('leaves a session of another project untouched when its id is replayed', async () => {
        const project = await trackingSeed.project();
        const intruder = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const original = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(60))]);
        await queue.process(original);

        await queue.process(trackingSeed.batch(intruder, [trackingSeed.click('/', secondsAgo(30))], { sessionId: original.sessionId }));
        await queue.process(trackingSeed.batch(intruder, [], { sessionId: original.sessionId }));

        expect(await Session.findOneByOrFail({ id: original.sessionId })).toMatchObject({ projectId: project.id, clicks: 0, events: 1 });
    });

    it('drops a batch whose project was removed', async () => {
        const project = await trackingSeed.project();
        const batch = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(5))]);
        await project.remove();

        await new IngestBatchQueue().process(batch);

        expect(await Event.count()).toBe(0);
        expect(await Person.count()).toBe(0);
    });

    it('records when the project last received events and announces the batch', async () => {
        const project = await trackingSeed.project();
        const emit = vi.spyOn(eventBus, 'emit');
        const batch = trackingSeed.batch(project, [trackingSeed.pageview('/', secondsAgo(5))]);

        await new IngestBatchQueue().process(batch);

        expect((await Project.findOneByOrFail({ id: project.id })).lastEventAt?.getTime()).toBe(batch.receivedAt);
        expect(emit).toHaveBeenCalledWith('tracking.batch.ingested', { projectId: project.id, sessionId: batch.sessionId });
    });
});
