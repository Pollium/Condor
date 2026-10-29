import { SessionDetail } from '@condor/contracts/sessions/domain';
import { baseCodeOf } from '@condor/contracts/shared/errors';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useMemo } from 'react';
import type { Mark } from '@/modules/sessions/components/ReplayControls';
import { sessionsApi } from '@/modules/sessions/api/api';
import { readRecording, type Recording } from '@/modules/sessions/utils/replay';

export interface SessionRecording{
    recording: Recording | null;
    state: 'ready' | 'loading' | 'missing' | 'failed';
    lead: number;
    marks: Mark[];
}

const TONES = { pageview: 'strong', click: 'soft', error: 'danger' } as const;

export const useRecording = (projectId: string, session: SessionDetail | null): SessionRecording => {
    const replay = useQuery(sessionsApi.replay, [projectId, session?.hasReplay ? session.id : undefined]);
    const recording = useMemo(() => (replay.data ? readRecording(replay.data.events) : null), [replay.data]);
    const lead = recording && session ? recording.start - Date.parse(session.startedAt) : 0;

    const marks = useMemo(() => {
        if(!recording || !session) return [];
        const timeline = session.timeline.flatMap((entry): Mark[] =>
            entry.type in TONES ? [{ key: entry.id, at: entry.offsetMs - lead, tone: entry.rage ? 'danger' : TONES[entry.type as keyof typeof TONES] }] : []);
        const consoleErrors = recording.console.filter(({ entry }) => entry.level === 'error').map(({ key, at }): Mark => ({ key: `c${key}`, at, tone: 'danger' }));
        const failed = recording.network.filter(({ entry }) => entry.failed || entry.status >= 500).map(({ key, at }): Mark => ({ key: `n${key}`, at, tone: 'danger' }));
        return [...timeline, ...consoleErrors, ...failed];
    }, [recording, session, lead]);

    const missing = session !== null && (!session.hasReplay || baseCodeOf(replay.error?.message ?? '') === 'Session::NoReplay' || (replay.data !== null && recording === null));
    const state = recording ? 'ready' : missing ? 'missing' : replay.error ? 'failed' : 'loading';

    return { recording, state, lead, marks };
};
