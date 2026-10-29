import { uuid } from './ids';
import { readJson, readStored, removeStored, writeStored } from './storage';
import { StoredSession } from './types';

const ANONYMOUS_KEY = 'condor.aid';
const USER_KEY = 'condor.uid';
const SESSION_KEY = 'condor.sid';
const IDLE_MS = 30 * 60_000;
const MAX_SESSION_MS = 24 * 60 * 60_000;

export default class Identity{
    #anonymousId: string;
    #userId: string | null;
    #session: StoredSession;
    #onRotate: () => void = () => undefined;

    constructor(){
        this.#anonymousId = readStored(ANONYMOUS_KEY) ?? this.#newAnonymousId();
        this.#userId = readStored(USER_KEY);
        this.#session = this.#restore() ?? this.#fresh();
        this.#persist();
    }

    get anonymousId(): string{
        return this.#anonymousId;
    }

    get userId(): string | null{
        return this.#userId;
    }

    get session(): StoredSession{
        return this.#session;
    }

    onRotate(listener: () => void){
        this.#onRotate = listener;
    }

    touch(now = Date.now()){
        if(this.#expired(this.#session, now)){
            this.#session = this.#fresh(now);
            this.#persist();
            this.#onRotate();
            return;
        }
        this.#session.lastActivity = now;
        this.#persist();
    }

    nextSeq(): number{
        const seq = this.#session.seq;
        this.#session.seq += 1;
        this.#persist();
        return seq;
    }

    sample(rate: number): boolean{
        if(this.#session.sampled === null){
            this.#session.sampled = Math.random() * 100 < rate;
            this.#persist();
        }
        return this.#session.sampled;
    }

    identify(userId: string){
        this.#userId = userId;
        writeStored(USER_KEY, userId);
    }

    reset(){
        this.#userId = null;
        removeStored(USER_KEY);
        this.#anonymousId = this.#newAnonymousId();
        this.#session = this.#fresh();
        this.#persist();
        this.#onRotate();
    }

    #newAnonymousId(): string{
        const id = uuid();
        writeStored(ANONYMOUS_KEY, id);
        return id;
    }

    #restore(): StoredSession | null{
        const stored = readJson<StoredSession>(SESSION_KEY);
        if(stored === null || typeof stored.id !== 'string') return null;
        return this.#expired(stored, Date.now()) ? null : stored;
    }

    #expired(session: StoredSession, now: number): boolean{
        return now - session.lastActivity > IDLE_MS || now - session.startedAt > MAX_SESSION_MS;
    }

    #fresh(now = Date.now()): StoredSession{
        return { id: uuid(), startedAt: now, lastActivity: now, seq: 0, sampled: null };
    }

    #persist(){
        writeStored(SESSION_KEY, JSON.stringify(this.#session));
    }
}
