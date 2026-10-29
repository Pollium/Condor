import ProjectDirectory from '../services/ProjectDirectory';
import Project from '@/modules/projects/models/Project';
import { eventBus } from '@readable/events/EventBus';
import { ingestProject, PROJECT_ID, PUBLIC_KEY } from '@tests/fixtures';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const stored = (): Project => {
    const { projectId, ...project } = ingestProject();
    return Object.assign(new Project(), project, { id: projectId });
};

describe('ProjectDirectory', () => {
    const lookup = vi.spyOn(Project, 'findOneBy');
    const clock = vi.spyOn(Date, 'now');
    let now: number;

    beforeEach(() => {
        now = 1_000_000;
        clock.mockImplementation(() => now);
        lookup.mockReset();
    });
    afterAll(() => {
        clock.mockRestore();
        lookup.mockRestore();
    });

    it('reads a key once and serves the cached project for a minute', async () => {
        const directory = new ProjectDirectory();
        lookup.mockResolvedValue(stored());

        expect(await directory.resolve(PUBLIC_KEY)).toEqual(ingestProject());
        now += 59_000;
        await directory.resolve(PUBLIC_KEY);

        expect(lookup).toHaveBeenCalledExactlyOnceWith({ publicKey: PUBLIC_KEY });

        now += 2_000;
        await directory.resolve(PUBLIC_KEY);

        expect(lookup).toHaveBeenCalledTimes(2);
    });

    it('remembers an unknown key for ten seconds', async () => {
        const directory = new ProjectDirectory();
        lookup.mockResolvedValue(null);

        await expect(directory.resolve('pk_missing')).rejects.toMatchObject({ message: 'Ingest::UnknownKey', statusCode: 401 });
        now += 9_000;
        await expect(directory.resolve('pk_missing')).rejects.toMatchObject({ message: 'Ingest::UnknownKey' });

        expect(lookup).toHaveBeenCalledOnce();

        now += 2_000;
        await expect(directory.resolve('pk_missing')).rejects.toMatchObject({ message: 'Ingest::UnknownKey' });

        expect(lookup).toHaveBeenCalledTimes(2);
    });

    it('does not cache a failed read', async () => {
        const directory = new ProjectDirectory();
        lookup.mockRejectedValueOnce(new Error('connection terminated')).mockResolvedValue(stored());

        await expect(directory.resolve(PUBLIC_KEY)).rejects.toThrow('connection terminated');

        expect(await directory.resolve(PUBLIC_KEY)).toEqual(ingestProject());
        expect(lookup).toHaveBeenCalledTimes(2);
    });

    it('drops every key of a changed project', async () => {
        const directory = new ProjectDirectory();
        lookup.mockResolvedValue(stored());
        await directory.resolve(PUBLIC_KEY);
        await directory.resolve('pk_other');

        eventBus.emit('project.changed', { projectId: PROJECT_ID, publicKeys: [PUBLIC_KEY] });
        await eventBus.settled();
        await directory.resolve(PUBLIC_KEY);
        await directory.resolve('pk_other');

        expect(lookup).toHaveBeenCalledTimes(3);
        expect(lookup).toHaveBeenLastCalledWith({ publicKey: PUBLIC_KEY });
    });
});
