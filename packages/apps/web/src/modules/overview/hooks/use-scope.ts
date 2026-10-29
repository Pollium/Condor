import { useProject } from '@/modules/projects/hooks/use-workspace';
import { usePeriodStore } from '@/shared/store/period';

export const useScope = () => {
    const project = useProject();
    const period = usePeriodStore((state) => state.period);
    return { projectId: project.id, period };
};
