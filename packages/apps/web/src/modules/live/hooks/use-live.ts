import { liveGateway, LiveFrames } from '@condor/contracts/live/gateway';
import { SessionSummary } from '@condor/contracts/sessions/domain';
import { useChannel } from '@condor/ui/hooks/socket/use-channel';
import '@/modules/live/contracts/channel';
import { useEffect, useState } from 'react';

type Snapshot = LiveFrames['live.snapshot'];

export const useLive = (projectId: string | null, onSession?: (session: SessionSummary) => void): Snapshot | null => {
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const channel = useChannel(liveGateway.channel, {
        'live.watch': setSnapshot,
        'live.snapshot': setSnapshot,
        'live.session': (session) => onSession?.(session)
    });
    const { status, send } = channel;

    useEffect(() => {
        if(status === 'open' && projectId !== null) send('live.watch', { projectId });
    }, [status, send, projectId]);

    return snapshot !== null && snapshot.projectId === projectId ? snapshot : null;
};
