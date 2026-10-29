import ModuleDiscovery, { Discovered } from '../services/ModuleDiscovery';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const discoverFrom = async (
    metaUrl: string,
    folders: string[] = ['modules']
): Promise<Discovered> => {
    const srcDir = join(dirname(fileURLToPath(metaUrl)), '..');

    return ModuleDiscovery.merge(await Promise.all(
        folders.map((folder) => new ModuleDiscovery(join(srcDir, folder)).discover())
    ));
};
