import { Segment } from '@condor/contracts/shared/segment';
import { create } from 'zustand';

interface SegmentState{
    byProject: Record<string, Segment>;
    setSegment: (projectId: string, segment: Segment | null) => void;
}

export const useSegmentStore = create<SegmentState>((set) => ({
    byProject: {},
    setSegment: (projectId, segment) => set((state) => {
        const byProject = { ...state.byProject };
        if(segment === null) delete byProject[projectId];
        else byProject[projectId] = segment;
        return { byProject };
    })
}));
