import ReplayChunk from '../models/ReplayChunk';
import Session from '../models/Session';
import Project from '@/modules/projects/models/Project';
import { objectStorage } from '@readable/storage/ObjectStorage';
import { findOrThrow } from '@readable/utils/models/find-or-throw';
import { Replay } from '@condor/contracts/sessions/domain';
import { SessionError } from '../contracts/domain/errors';
import { ReplayFrame } from '../contracts/domain/replay';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';

const inflate = promisify(gunzip);

export default class ReplayService{
    async get(project: Project, sessionId: string): Promise<Replay>{
        const session = await findOrThrow(Session, { id: sessionId, projectId: project.id }, () => SessionError.NotFound());
        const chunks = await ReplayChunk.find({
            where: { sessionId: session.id, projectId: project.id },
            order: { seq: 'ASC' }
        });
        if(chunks.length === 0) throw SessionError.NoReplay();

        const frames = await Promise.all(chunks.map((chunk) => this.#read(chunk.storageKey)));

        return {
            sessionId: session.id,
            chunks: chunks.length,
            events: frames.flat().sort((left, right) => left.timestamp - right.timestamp)
        };
    }

    async #read(storageKey: string): Promise<ReplayFrame[]>{
        const raw = await inflate(await objectStorage.get(storageKey));

        return JSON.parse(raw.toString('utf8')) as ReplayFrame[];
    }
}
