const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 2_000;

export type Outcome = 'sent' | 'rejected' | 'unknown-key' | 'disabled';

interface Pending{
    url: string;
    body: string;
    attempts: number;
    keepalive: boolean;
}

export default class Transport{
    #retries: Pending[] = [];
    #timer: ReturnType<typeof setTimeout> | null = null;

    async post(url: string, payload: unknown): Promise<Outcome>{
        return this.#send({ url, body: JSON.stringify(payload), attempts: 0, keepalive: false });
    }

    beacon(url: string, payload: unknown): boolean{
        const body = JSON.stringify(payload);
        if(typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))) return true;

        void this.#send({ url, body, attempts: MAX_ATTEMPTS - 1, keepalive: body.length < 60_000 });
        return false;
    }

    async #send(pending: Pending): Promise<Outcome>{
        try{
            const response = await fetch(pending.url, {
                method: 'POST',
                body: pending.body,
                keepalive: pending.keepalive,
                credentials: 'omit',
                headers: { 'content-type': 'text/plain' }
            });
            if(response.ok) return 'sent';
            if(response.status === 401) return 'unknown-key';
            if(response.status === 403) return 'disabled';
            if(response.status >= 500 || response.status === 429) this.#retry(pending);
            return 'rejected';
        }catch{
            this.#retry(pending);
            return 'rejected';
        }
    }

    #retry(pending: Pending){
        if(pending.attempts + 1 >= MAX_ATTEMPTS) return;
        this.#retries.push({ ...pending, attempts: pending.attempts + 1 });
        if(this.#timer !== null) return;

        this.#timer = setTimeout(() => {
            this.#timer = null;
            const due = this.#retries.splice(0);
            for(const item of due) void this.#send(item);
        }, BASE_DELAY_MS * 2 ** pending.attempts);
    }
}
