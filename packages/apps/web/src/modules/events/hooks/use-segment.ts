import { SegmentQuery } from '@condor/contracts/shared/segment';
import { useMemo } from 'react';
import { useSegmentStore } from '@/shared/store/segment';

export const useSegmentQuery = (projectId: string): SegmentQuery => {
    const segment = useSegmentStore((state) => state.byProject[projectId]);
    return useMemo(() => segment ? { traitKey: segment.key, traitValue: segment.value } : {}, [segment]);
};
