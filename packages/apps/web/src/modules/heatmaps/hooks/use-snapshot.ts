import { HeatSnapshot } from '@condor/contracts/heatmaps/domain';
import { sessionRoutes } from '@condor/contracts/sessions/routes';
import { useQuery } from '@pollium/readable-react/query/useQuery';
import { Replayer } from '@rrweb/replay';
import { useEffect, useState } from 'react';

type ReplayEvents = ConstructorParameters<typeof Replayer>[0];

export const useSnapshot = (projectId: string, snapshot: HeatSnapshot | null, width: number, height: number) => {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
    const replay = useQuery(sessionRoutes.replay, snapshot !== null && { path: { projectId, sessionId: snapshot.sessionId } });
    const events = replay.data?.sessionId === snapshot?.sessionId ? replay.data?.events : undefined;

    useEffect(() => {
        if(!root || !snapshot || !events || events.length < 2) return;

        const replayer = new Replayer(events as ReplayEvents, {
            root,
            mouseTail: false,
            skipInactive: false,
            showWarning: false,
            triggerFocus: false,
            pauseAnimation: true
        });
        replayer.pause(Math.max(0, snapshot.timestamp - replayer.getMetaData().startTime));

        const iframe = replayer.iframe;
        iframe.width = String(width);
        iframe.height = String(height);
        Object.assign(iframe.style, { width: `${width}px`, height: `${height}px`, border: '0', display: 'block' });
        const shown = requestAnimationFrame(() => setFrame(iframe));

        return () => {
            cancelAnimationFrame(shown);
            replayer.destroy();
            setFrame(null);
        };
    }, [root, events, snapshot, width, height]);

    return { setRoot, frame, failed: replay.error !== undefined };
};
