import ConnectionsRegistry from '../lib/gateway/ConnectionRegistry';
import { WebSocket } from '@fastify/websocket';
import { describe, expect, it } from 'vitest';

interface Listener{
    socket: WebSocket;
    received: () => string[];
}

const listener = (): Listener => {
    const sent: string[] = [];
    const socket = { send: (raw: string) => sent.push(raw) } as unknown as WebSocket;

    return {
        socket,
        received: () => sent.map((raw) => (JSON.parse(raw) as { type: string }).type)
    };
};

const frame = (type: string) => ({ type, data: null });

describe('ConnectionsRegistry', () => {
    it('drops a closed socket from every room it joined', () => {
        const registry = new ConnectionsRegistry();
        const closed = listener();
        const open = listener();

        registry.add(closed.socket);
        registry.add(open.socket);
        registry.join(closed.socket, 'team:a');
        registry.join(closed.socket, 'user:a');
        registry.join(open.socket, 'team:a');

        registry.remove(closed.socket);
        registry.sendToRoom('team:a', frame('after.close'));
        registry.sendToRoom('user:a', frame('after.close'));

        expect(closed.received()).toEqual([]);
        expect(open.received()).toEqual(['after.close']);
        expect(registry.size).toBe(1);
    });

    it('sends once to a socket in several of the rooms it is sent to', () => {
        const registry = new ConnectionsRegistry();
        const both = listener();
        const one = listener();
        const neither = listener();

        registry.add(both.socket);
        registry.add(one.socket);
        registry.add(neither.socket);
        registry.join(both.socket, 'team:a');
        registry.join(both.socket, 'user:a');
        registry.join(one.socket, 'user:a');
        registry.join(neither.socket, 'team:b');

        registry.sendToRooms(['team:a', 'user:a', 'course:a'], frame('task'));

        expect(both.received()).toEqual(['task']);
        expect(one.received()).toEqual(['task']);
        expect(neither.received()).toEqual([]);
    });

    it('keeps the other rooms of a socket that leaves one', () => {
        const registry = new ConnectionsRegistry();
        const member = listener();

        registry.add(member.socket);
        registry.join(member.socket, 'team:a');
        registry.join(member.socket, 'user:a');

        registry.leave(member.socket, 'team:a');
        registry.sendToRoom('team:a', frame('team.only'));
        registry.sendToRoom('user:a', frame('user.only'));

        expect(member.received()).toEqual(['user.only']);
    });

    it('forgets a room once its last member is gone', () => {
        const registry = new ConnectionsRegistry();
        const member = listener();

        registry.add(member.socket);
        registry.join(member.socket, 'tower:7d');
        expect(registry.has('tower:7d')).toBe(true);

        registry.remove(member.socket);

        expect(registry.has('tower:7d')).toBe(false);
    });
});
