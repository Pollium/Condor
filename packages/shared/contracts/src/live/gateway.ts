import { gateway } from '@pollium/readable-contracts/gateway';
import { LiveSnapshot } from '../overview/domain';
import { SessionSummary } from '../sessions/domain';

export interface LiveWatchMessage{
    projectId: string;
}

export interface LiveWatchFrame{
    type: 'live.watch';
    data: LiveSnapshot & { projectId: string };
}

export interface LiveSnapshotFrame{
    type: 'live.snapshot';
    data: LiveSnapshot & { projectId: string };
}

export interface LiveSessionFrame{
    type: 'live.session';
    data: SessionSummary;
}

export type LiveFrame = LiveWatchFrame | LiveSnapshotFrame | LiveSessionFrame;

export type LiveFrames = {
    [T in LiveFrame['type']]: Extract<LiveFrame, { type: T }>['data'];
};

export interface LiveMessages{
    'live.watch': LiveWatchMessage;
}

export const liveGateway = gateway<LiveFrames, LiveMessages>('/live');
