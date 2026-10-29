export default class Activity{
    #lastMutation = 0;
    #lastRequest = 0;
    #lastNavigation = 0;
    #mutations: MutationObserver | null = null;
    #resources: PerformanceObserver | null = null;
    #ignoredOrigin: string | null = null;

    ignore(origin: string){
        this.#ignoredOrigin = origin;
    }

    start(){
        this.#mutations = new MutationObserver(() => {
            this.#lastMutation = Date.now();
        });
        this.#mutations.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });

        if(typeof PerformanceObserver === 'undefined') return;
        try{
            this.#resources = new PerformanceObserver((list) => {
                const foreign = list.getEntries().some((entry) => this.#ignoredOrigin === null || !entry.name.startsWith(this.#ignoredOrigin));
                if(foreign) this.#lastRequest = Date.now();
            });
            this.#resources.observe({ type: 'resource', buffered: false });
        }catch{
            this.#resources = null;
        }
    }

    stop(){
        this.#mutations?.disconnect();
        this.#resources?.disconnect();
    }

    request(){
        this.#lastRequest = Date.now();
    }

    navigation(){
        this.#lastNavigation = Date.now();
    }

    since(timestamp: number): boolean{
        return this.#lastMutation > timestamp || this.#lastRequest > timestamp || this.#lastNavigation > timestamp;
    }
}
