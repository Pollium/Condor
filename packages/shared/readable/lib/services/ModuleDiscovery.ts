import BaseController from '../controllers/BaseController';
import BaseGateway from '../gateway/BaseGateway';
import BaseQueue from '../queues/BaseQueue';
import { getControllerPrefix } from '../decorators/controllers/Controller';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface MountedController{
    prefix: string;
    Controller: new () => BaseController;
}

export interface Discovered{
    controllers: MountedController[];
    entities: Function[];
    events: Array<new () => object>;
    queues: Array<new () => BaseQueue<unknown>>;
    gateways: Array<new () => BaseGateway>;
}

export default class ModuleDiscovery{
    constructor(private readonly modulesDir: string){}

    async discover(): Promise<Discovered>{
        const names = (await readdir(this.modulesDir, { withFileTypes: true }))
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();

        const discovered: Discovered = {
            controllers: [], entities: [], events: [], queues: [], gateways: []
        };

        for(const name of names){
            const controllers = await this.#loadDefaults<new () => BaseController>(name, 'controllers');
            discovered.controllers.push(...controllers.map((Controller) => ({
                prefix: getControllerPrefix(Controller) ?? `/${name}`,
                Controller
            })));
            discovered.entities.push(...await this.#loadDefaults<Function>(name, 'models'));
            discovered.events.push(...await this.#loadDefaults<new () => object>(name, 'events'));
            discovered.queues.push(...await this.#loadDefaults<new () => BaseQueue<unknown>>(name, 'queues'));
            discovered.gateways.push(...await this.#loadDefaults<new () => BaseGateway>(name, 'gateways'));
        }

        return discovered;
    }

    static merge(parts: Discovered[]): Discovered{
        const discovered: Discovered = {
            controllers: [], entities: [], events: [], queues: [], gateways: []
        };

        for(const part of parts){
            discovered.controllers.push(...part.controllers);
            discovered.entities.push(...part.entities);
            discovered.events.push(...part.events);
            discovered.queues.push(...part.queues);
            discovered.gateways.push(...part.gateways);
        }

        return discovered;
    }

    async #loadDefaults<T>(moduleName: string, category: string): Promise<T[]>{
        const dir = join(this.modulesDir, moduleName, category);

        let files: string[];
        try{
            files = await readdir(dir);
        }catch{
            return [];
        }

        const loaded: T[] = [];
        for(const file of files.sort()){
            if(!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
            const imported = await import(pathToFileURL(join(dir, file)).href) as { default?: T };
            if(imported.default) loaded.push(imported.default);
        }
        return loaded;
    }
}
