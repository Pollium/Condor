import { HeatSnapshot } from '@condor/contracts/heatmaps/domain';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { Replayer } from '@rrweb/replay';
import { useEffect, useState } from 'react';
import { heatmapsApi } from '@/modules/heatmaps/api/api';

type ReplayEvents = ConstructorParameters<typeof Replayer>[0];

export const useSnapshot = (projectId: string, snapshot: HeatSnapshot | null, width: number, height: number) => {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
    const replay = useQuery(heatmapsApi.replay, [snapshot ? projectId : undefined, snapshot?.sessionId]);
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
