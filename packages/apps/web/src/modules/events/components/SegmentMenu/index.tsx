import { useQuery } from '@condor/ui/hooks/api/use-query';
import { eventsApi } from '@/modules/events/api/api';
import type { Choice } from '@/shared/components/Segmented';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { useSegmentStore } from '@/shared/store/segment';

const EVERYONE = '';
const SEPARATOR = '\u0000';

const SegmentMenu = ({ projectId }: { projectId: string }) => {
    const traits = useQuery(eventsApi.traits, [projectId]);
    const segment = useSegmentStore((state) => state.byProject[projectId]);
    const setSegment = useSegmentStore((state) => state.setSegment);
    const current = segment ? `${segment.key}${SEPARATOR}${segment.value}` : EVERYONE;
    const choices: Choice<string>[] = [
        { value: EVERYONE, label: 'Todas las personas' },
        ...(traits.data ?? []).flatMap((trait) => trait.values.map((entry) => ({
            value: `${trait.key}${SEPARATOR}${entry.value}`,
            label: `${trait.key}: ${entry.value}`
        })))
    ];
    if(segment && !choices.some((choice) => choice.value === current)){
        choices.push({ value: current, label: `${segment.key}: ${segment.value}` });
    }
    if(choices.length === 1) return null;

    const choose = (value: string) => {
        const [key, chosen] = value.split(SEPARATOR);
        setSegment(projectId, value === EVERYONE ? null : { key, value: chosen });
    };

    return <ToolbarMenu label='Personas' choices={choices} value={current} onChange={choose} />;
};

export default SegmentMenu;
