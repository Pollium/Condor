import IngestBatchQueue from '@/modules/tracking/queues/IngestBatchQueue';
import { secondsAgo, trackingSeed } from '@/modules/tracking/tests/TrackingSeed';
import JWTService from '@readable/auth/JWTService';
import { liveGateway, LiveFrame } from '@condor/contracts/live/gateway';
import User from '@/modules/users/models/User';
import { useApp } from '@tests/harness';
import { actor } from '@tests/roles';
import { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';

const THROTTLED_WAIT = { timeout: 3000 };

interface Watcher{
    socket: WebSocket;
    frames: Array<LiveFrame | { type: string; data?: unknown; error?: string }>;
    watch: (projectId: string) => void;
}

const connect = async (app: FastifyInstance, userId: string): Promise<Watcher> => {
    const frames: Watcher['frames'] = [];
    await app.ready();
    const socket = await app.injectWS(`${liveGateway.channel}?token=${new JWTService().sign(userId)}`, {}, {
        onInit: (client) => client.on('message', (raw) => frames.push(JSON.parse(String(raw)) as Watcher['frames'][number]))
    });

    return {
        socket,
        frames,
        watch: (projectId) => socket.send(JSON.stringify({ type: 'live.watch', projectId }))
    };
};

const typesOf = (watcher: Watcher): string[] => watcher.frames.map((frame) => frame.type ?? 'error');

describe('LiveGateway', () => {
    const ctx = useApp();

    it('refuses a socket without a token', async () => {
        await ctx.app.ready();

        await expect(ctx.app.injectWS(liveGateway.channel)).rejects.toThrow('401');
    });

    it('acknowledges a watch with the live snapshot, then pushes the project\'s new activity', async () => {
        const project = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        await queue.process(trackingSeed.batch(project, [trackingSeed.pageview('/carrito', secondsAgo(20))]));
        const viewer = await connect(ctx.app, await actor('viewer'));

        viewer.watch(project.id);
        await expect.poll(() => viewer.frames).toHaveLength(1);
        expect(viewer.frames[0]).toEqual({
            type: 'live.watch',
            data: { projectId: project.id, count: 1, pages: [{ path: '/carrito', people: 1 }] }
        });

        const arriving = trackingSeed.batch(project, [trackingSeed.pageview('/checkout', secondsAgo(2))]);
        await queue.process(arriving);

        await expect.poll(() => typesOf(viewer), THROTTLED_WAIT).toEqual(['live.watch', 'live.snapshot', 'live.session']);
        expect(viewer.frames[1]).toMatchObject({ data: { projectId: project.id, count: 2 } });
        expect(viewer.frames[2]).toMatchObject({ data: { id: arriving.sessionId, live: true, currentPath: '/checkout' } });
        viewer.socket.terminate();
    });

    it('coalesces a burst of batches and keeps other projects\' traffic out', async () => {
        const project = await trackingSeed.project();
        const elsewhere = await trackingSeed.project();
        const queue = new IngestBatchQueue();
        const viewer = await connect(ctx.app, await actor('viewer'));
        viewer.watch(project.id);
        await expect.poll(() => viewer.frames).toHaveLength(1);

        for(let index = 0; index < 5; index++){
            await queue.process(trackingSeed.batch(project, [trackingSeed.pageview('/productos', secondsAgo(5))]));
            await queue.process(trackingSeed.batch(elsewhere, [trackingSeed.pageview('/', secondsAgo(5))]));
        }

        await expect.poll(() => viewer.frames.at(-1), THROTTLED_WAIT).toMatchObject({ type: 'live.session' });
        await expect.poll(() => viewer.frames.filter((frame) => frame.type === 'live.session'), THROTTLED_WAIT).toHaveLength(5);
        const snapshots = viewer.frames.filter((frame) => frame.type === 'live.snapshot');
        expect(snapshots.length).toBeLessThanOrEqual(2);
        expect(snapshots.at(-1)).toMatchObject({ data: { projectId: project.id, count: 5 } });
        viewer.socket.terminate();
    });

    it('answers a watch for a missing project or a removed member with an error frame', async () => {
        const viewerId = await actor('viewer');
        const viewer = await connect(ctx.app, viewerId);

        viewer.watch(randomUUID());
        await expect.poll(() => viewer.frames).toEqual([{ error: 'Project::NotFound' }]);

        await User.delete({ id: viewerId });
        viewer.watch((await trackingSeed.project()).id);
        await expect.poll(() => viewer.frames).toHaveLength(2);
        expect(viewer.frames[1]).toEqual({ error: 'Auth::Unauthorized' });
        viewer.socket.terminate();
    });
});
