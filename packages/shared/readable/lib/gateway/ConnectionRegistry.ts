import { OutboundMessage } from '../contracts/gateway';
import { WebSocket } from '@fastify/websocket';

export default class ConnectionsRegistry{
    #sockets = new Set<WebSocket>();
    #rooms = new Map<string, Set<WebSocket>>();
    #memberships = new WeakMap<WebSocket, Set<string>>();
    
    add(socket: WebSocket){
        this.#sockets.add(socket);
    }

    remove(socket: WebSocket){
        this.leaveAll(socket);
        this.#sockets.delete(socket);
    }

    join(socket: WebSocket, room: string){
        let members = this.#rooms.get(room);
        if(!members){
            members = new Set();
            this.#rooms.set(room, members);
        }

        members.add(socket);

        const memberships = this.#memberships.get(socket) ?? new Set<string>();
        memberships.add(room);
        this.#memberships.set(socket, memberships);
    }

    leave(socket: WebSocket, room: string){
        const members = this.#rooms.get(room);
        members?.delete(socket);
        if(members?.size === 0) this.#rooms.delete(room);

        this.#memberships.get(socket)?.delete(room);
    }

    leaveAll(socket: WebSocket){
        for(const room of this.#memberships.get(socket) ?? []) this.leave(socket, room);

        this.#memberships.delete(socket);
    }

    has(room: string): boolean{
        return this.#rooms.has(room);
    }

    broadcast(message: OutboundMessage<unknown>){
        this.#send(this.#sockets, message);
    }

    sendTo(socket: WebSocket, message: OutboundMessage<unknown>){
        this.#send([socket], message);
    }

    sendToRoom(room: string, message: OutboundMessage<unknown>){
        const members = this.#rooms.get(room);
        if(members) this.#send(members, message);
    }

    sendToRooms(rooms: string[], message: OutboundMessage<unknown>){
        this.#send(new Set(rooms.flatMap((room) => [...this.#rooms.get(room) ?? []])), message);
    }

    #send(sockets: Iterable<WebSocket>, message: OutboundMessage<unknown>){
        const raw = JSON.stringify(message);
        for(const socket of sockets) socket.send(raw);
    }

    get size(): number{
        return this.#sockets.size;
    }
}
