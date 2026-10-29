import { LiveSnapshot } from '../overview/domain';
import { SessionSummary } from '../sessions/domain';

export const liveGateway = {
    channel: '/live'
} as const;

export interface LiveWatchMessage{
    projectId: string;
}

export interface LiveSnapshotFrame{
    type: 'live.snapshot';
    data: LiveSnapshot & { projectId: string };
}

export interface LiveSessionFrame{
    type: 'live.session';
    data: SessionSummary;
}

export type LiveFrame = LiveSnapshotFrame | LiveSessionFrame;

export type LiveFrames = {
    [T in LiveFrame['type']]: Extract<LiveFrame, { type: T }>['data'];
};
