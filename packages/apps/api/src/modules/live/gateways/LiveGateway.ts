import LiveSnapshotService from '../services/LiveSnapshot';
import LiveThrottle from '../services/LiveThrottle';
import Project from '@/modules/projects/models/Project';
import Session from '@/modules/sessions/models/Session';
import SessionSummariesService from '@/modules/sessions/services/SessionSummaries';
import BaseGateway, {
    Channel,
    OnMessage,
    Payload,
    Socket
} from '@pollium/readable/gateway/Gateway';
import { CurrentUser } from '@pollium/readable/auth/params';
import { SocketAuthenticatedRoute } from '@pollium/readable/auth/guards';
import { Middleware } from '@pollium/readable/http/middleware';
import { eventBus } from '@pollium/readable/events/EventBus';
import { parseId } from '@pollium/readable/http/params';
import { findOrThrow } from '@pollium/readable/database/queries';
import { liveGateway, LiveSessionFrame, LiveSnapshotFrame, LiveWatchMessage } from '@condor/contracts/live/gateway';
import { ProjectError } from '@/modules/projects/contracts/domain/errors';
import { assertRole, MEMBER_ROLES } from '@/shared/access/role-route';
import { WebSocket } from '@fastify/websocket';
import { In } from 'typeorm';

type LiveSnapshotData = LiveSnapshotFrame['data'];

@Channel(liveGateway.channel)
@Middleware(SocketAuthenticatedRoute)
export default class LiveGateway extends BaseGateway{
    #snapshots = new LiveSnapshotService();
    #summaries = new SessionSummariesService();
    #throttle = new LiveThrottle((projectId, sessionIds) => this.#push(projectId, sessionIds));
    #watching = new WeakMap<WebSocket, string>();

    constructor(){
        super();

        eventBus.on('tracking.batch.ingested', ({ projectId, sessionId }) => {
            if(this.connections.has(this.#room(projectId))){
                this.#throttle.mark(projectId, sessionId);
            }
        });
    }

    @OnMessage('live.watch')
    async watch(
        @CurrentUser() userId: string,
        @Payload() payload: LiveWatchMessage,
        @Socket() socket: WebSocket
    ): Promise<LiveSnapshotData>{
        await assertRole(userId, MEMBER_ROLES);
        const project = await findOrThrow(Project, { id: parseId(payload.projectId) }, () => ProjectError.NotFound());

        const previous = this.#watching.get(socket);
        if(previous !== undefined) this.connections.leave(socket, this.#room(previous));
        this.connections.join(socket, this.#room(project.id));
        this.#watching.set(socket, project.id);

        return this.#snapshot(project.id);
    }

    async #push(projectId: string, sessionIds: string[]){
        const room = this.#room(projectId);
        if(!this.connections.has(room)) return;

        const sessions = await Session.findBy({ id: In(sessionIds), projectId });
        const snapshot: LiveSnapshotFrame = {
            type: 'live.snapshot',
            data: await this.#snapshot(projectId)
        };
        this.connections.sendToRoom(room, snapshot);

        for(const summary of await this.#summaries.of(sessions)){
            const frame: LiveSessionFrame = {
                type: 'live.session',
                data: summary
            };
            this.connections.sendToRoom(room, frame);
        }
    }

    async #snapshot(projectId: string): Promise<LiveSnapshotData>{
        return {
            projectId,
            ...await this.#snapshots.of(projectId)
        };
    }

    #room(projectId: string): string{
        return `project:${projectId}`;
    }
}
