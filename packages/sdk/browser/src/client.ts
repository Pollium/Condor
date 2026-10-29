import { RemoteConfig } from '@condor/contracts/ingest/config';
import { REPLAY_CUSTOM_TAGS, WireEvent } from '@condor/contracts/ingest/wire';
import Activity from './capture/activity';
import ClickTracker from './capture/clicks';
import ConsoleTracker from './capture/console';
import ErrorTracker from './capture/errors';
import NetworkTracker from './capture/network';
import PageTracker from './capture/pages';
import { trackVitals } from './capture/vitals';
import Identity from './identity';
import { uuid } from './ids';
import { currentPath } from './location';
import EventQueue from './queue';
import Recorder from './recorder';
import { fetchRemoteConfig } from './remote-config';
import { readStored, removeStored, writeStored } from './storage';
import Transport, { Outcome } from './transport';
import { EventDraft, EventPlace, InitOptions, Traits } from './types';

const OPT_OUT_KEY = 'condor.optout';
const HEARTBEAT_MS = 30_000;
const LIVE_IDLE_MS = 5 * 60_000;
const TOUCH_EVERY_MS = 10_000;

interface Stoppable{
    stop: () => void;
}

export class Condor{
    #options: InitOptions | null = null;
    #host = '';
    #started = false;
    #ready = false;
    #pending: Array<() => void> = [];
    #identity: Identity | null = null;
    #transport = new Transport();
    #queue: EventQueue | null = null;
    #recorder: Recorder | null = null;
    #activity = new Activity();
    #pages: PageTracker | null = null;
    #errors: ErrorTracker | null = null;
    #trackers: Stoppable[] = [];
    #heartbeat: ReturnType<typeof setInterval> | null = null;
    #lastTouch = 0;
    #onHidden = () => {
        if(document.visibilityState === 'hidden') this.#beacon();
    };
    #onPageHide = () => {
        this.#pages?.leave();
        this.#beacon();
    };

    init(options: InitOptions){
        if(this.#started || typeof window === 'undefined') return;
        if(readStored(OPT_OUT_KEY) === '1') return;
        if(options.respectDnt === true && navigator.doNotTrack === '1') return;

        this.#started = true;
        this.#options = options;
        this.#host = (options.host ?? window.location.origin).replace(/\/+$/, '');
        this.#activity.ignore(new URL(this.#host, window.location.href).origin);
        this.#identity = new Identity();
        this.#queue = new EventQueue(
            { key: options.key, endpoint: `${this.#host}/i/batch`, release: options.release },
            this.#identity,
            this.#transport,
            (outcome) => this.#outcome(outcome)
        );
        void this.#boot();
    }

    track(name: string, props?: Traits){
        this.#whenReady(() => this.#emit({ type: 'custom', name: name.slice(0, 128), ...(props === undefined ? {} : { props }) }));
    }

    identify(userId: string, traits?: Traits){
        this.#whenReady(() => {
            this.#identity?.identify(userId);
            this.#emit({ type: 'identify', userId: userId.slice(0, 256), ...(traits === undefined ? {} : { traits }) });
        });
    }

    page(){
        this.#whenReady(() => {
            if(this.#pages === null){
                this.#emit({ type: 'pageview' });
                return;
            }
            this.#pages.page();
        });
    }

    reset(){
        this.#whenReady(() => this.#identity?.reset());
    }

    optOut(){
        writeStored(OPT_OUT_KEY, '1');
        this.#shutdown();
    }

    optIn(){
        removeStored(OPT_OUT_KEY);
    }

    async flush(): Promise<void>{
        this.#recorder?.flush();
        await this.#queue?.flush();
    }

    sessionId(): string | null{
        return this.#identity?.session.id ?? null;
    }

    anonymousId(): string | null{
        return this.#identity?.anonymousId ?? null;
    }

    async #boot(){
        const options = this.#options!;
        const result = await fetchRemoteConfig(this.#host, options.key);
        if(result.kind === 'unknown-key'){
            this.#debug('unknown project key, Condor is disabled');
            this.#shutdown();
            return;
        }

        const config = result.kind === 'ok' ? result.config : null;
        if(config?.respectDnt === true && navigator.doNotTrack === '1'){
            this.#shutdown();
            return;
        }

        this.#queue!.start();
        this.#identity!.onRotate(() => this.#rotated());
        if(config !== null && options.recording !== false) this.#record(config);
        if(options.autocapture !== false) this.#autocapture(config);
        this.#lifecycle();
        this.#ready = true;
        for(const run of this.#pending.splice(0)) run();
    }

    #record(config: RemoteConfig){
        this.#recorder = new Recorder(
            { key: this.#options!.key, endpoint: `${this.#host}/i/replay` },
            this.#identity!,
            this.#transport,
            (outcome) => this.#outcome(outcome)
        );
        this.#recorder.start({
            ...config.recording,
            maskInputs: config.recording.maskInputs || this.#options!.maskAllInputs === true
        });
        this.#trackers.push(this.#recorder);
    }

    #autocapture(config: RemoteConfig | null){
        this.#activity.start();
        this.#trackers.push(this.#activity);

        const errors = new ErrorTracker(this.#emit);
        errors.start();
        this.#errors = errors;
        this.#trackers.push(errors);

        trackVitals(this.#emit);

        const clicks = new ClickTracker(this.#emit, this.#activity);
        clicks.start();
        this.#trackers.push(clicks);

        if(config?.recording.captureNetwork === true){
            const network = new NetworkTracker(new URL(this.#host).origin, this.#activity, {
                request: (entry) => {
                    this.#recorder?.custom(REPLAY_CUSTOM_TAGS.network, entry);
                    if(entry.failed || entry.status >= 500){
                        errors.report('Network', `${entry.method} ${entry.url} → ${entry.status || 'failed'}`);
                    }
                }
            });
            network.start();
            this.#trackers.push(network);
        }

        if(config?.recording.captureConsole === true && this.#recorder?.active === true){
            const consoleTracker = new ConsoleTracker((entry) => this.#recorder?.custom(REPLAY_CUSTOM_TAGS.console, entry));
            consoleTracker.start();
            this.#trackers.push(consoleTracker);
        }

        this.#pages = new PageTracker(this.#emit, this.#activity, () => this.#interacted());
        this.#pages.start();
        this.#trackers.push(this.#pages);
    }

    #lifecycle(){
        document.addEventListener('visibilitychange', this.#onHidden);
        window.addEventListener('pagehide', this.#onPageHide);
        this.#heartbeat = setInterval(() => this.#beat(), HEARTBEAT_MS);
    }

    #emit = (draft: EventDraft, place?: EventPlace) => {
        if(this.#queue === null || this.#identity === null) return;
        if(draft.type !== 'pageleave') this.#touch();

        const event = {
            ...draft,
            id: uuid(),
            timestamp: Date.now(),
            path: (place?.path ?? currentPath()).slice(0, 2048),
            title: (place?.title ?? document.title).slice(0, 512)
        } as WireEvent;

        if(draft.type === 'pageview') this.#errors?.pageChanged();
        this.#queue.push(event);
    };

    #touch(){
        this.#lastTouch = Date.now();
        this.#identity?.touch(this.#lastTouch);
    }

    #interacted(){
        if(Date.now() - this.#lastTouch > TOUCH_EVERY_MS) this.#touch();
    }

    #rotated(){
        this.#recorder?.restart();
        this.#pages?.resume();
    }

    #beat(){
        if(this.#queue === null || this.#identity === null || document.visibilityState !== 'visible') return;
        if(Date.now() - this.#identity.session.lastActivity > LIVE_IDLE_MS) return;
        if(this.#queue.size > 0){
            void this.#queue.flush();
            return;
        }
        this.#queue.heartbeat();
    }

    #beacon(){
        this.#recorder?.flush(true);
        this.#queue?.beacon();
    }

    #whenReady(run: () => void){
        if(this.#ready){
            run();
            return;
        }
        this.#pending.push(run);
    }

    #outcome(outcome: Outcome){
        if(outcome === 'unknown-key') this.#shutdown();
    }

    #shutdown(){
        for(const tracker of this.#trackers) tracker.stop();
        this.#trackers = [];
        this.#queue?.stop();
        this.#pending = [];
        if(this.#heartbeat !== null) clearInterval(this.#heartbeat);
        document.removeEventListener('visibilitychange', this.#onHidden);
        window.removeEventListener('pagehide', this.#onPageHide);
    }

    #debug(message: string){
        if(this.#options?.debug === true) console.info(`[condor] ${message}`);
    }
}
