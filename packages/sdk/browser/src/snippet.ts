import { condor } from './index';

type QueuedCall = [keyof typeof condor, ...unknown[]];

declare global{
    interface Window{
        condor: typeof condor | QueuedCall[] | undefined;
    }
}

const script = document.currentScript instanceof HTMLScriptElement ? document.currentScript : null;
const queued = Array.isArray(window.condor) ? window.condor : [];
window.condor = condor;

const key = script?.dataset.key;
if(key){
    condor.init({
        key,
        host: script?.dataset.host ?? new URL(script!.src, window.location.href).origin,
        release: script?.dataset.release
    });
}

for(const [method, ...args] of queued){
    const run = condor[method] as (...input: unknown[]) => unknown;
    if(typeof run === 'function') run.apply(condor, args);
}
