import { liveGateway, LiveFrames } from '@condor/contracts/live/gateway';
import { SessionSummary } from '@condor/contracts/sessions/domain';
import { useChannel } from '@pollium/readable-react/live/useChannel';
import { useState } from 'react';

type Snapshot = LiveFrames['live.snapshot'];

export const useLive = (projectId: string | null, onSession?: (session: SessionSummary) => void): Snapshot | null => {
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    useChannel(liveGateway, {
        'live.watch': setSnapshot,
        'live.snapshot': setSnapshot,
        'live.session': (session) => onSession?.(session)
    }, { join: projectId === null ? null : ['live.watch', { projectId }] });

    return snapshot !== null && snapshot.projectId === projectId ? snapshot : null;
};
