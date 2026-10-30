import { Button, InlineLoading } from '@carbon/react';
import { Flow, WarningAlt } from '@carbon/icons-react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { useState } from 'react';
import { journeysApi } from '@/modules/journeys/api/api';
import JourneyView from '@/modules/journeys/components/JourneyView';
import StartPicker from '@/modules/journeys/components/StartPicker';
import { copy } from '@/modules/journeys/i18n';
import { useProject } from '@/modules/projects/hooks/use-workspace';
import EmptyState from '@/shared/components/EmptyState';
import { PageHeader } from '@/shared/components/Page';
import type { Choice } from '@/shared/components/Segmented';
import ToolbarMenu from '@/shared/components/ToolbarMenu';
import { copy as shared } from '@/shared/i18n';
import { usePeriodStore } from '@/shared/store/period';
import { errorCopy } from '@/shared/utils/error-copy';

type Steps = '3' | '4' | '5' | '6';
type Exits = 'true' | 'false';

const STEPS: Choice<Steps>[] = [
    { value: '3', label: copy.page.steps(3) },
    { value: '4', label: copy.page.steps(4) },
    { value: '5', label: copy.page.steps(5) },
    { value: '6', label: copy.page.steps(6) }
];

const EXITS: Choice<Exits>[] = [
    { value: 'true', label: copy.page.withExits },
    { value: 'false', label: copy.page.withoutExits }
];

const JourneysPage = () => {
    const project = useProject();
    const period = usePeriodStore((state) => state.period);
    const [steps, setSteps] = useState<Steps>('4');
    const [exits, setExits] = useState<Exits>('true');
    const [start, setStart] = useState<string | null>(null);
    const journey = useQuery(journeysApi.journey, [project.id, { period, steps: Number(steps), exits, start: start ?? undefined }]);

    const body = () => {
        if(journey.error && !journey.data){
            return (
                <EmptyState icon={WarningAlt} title={copy.page.loadFailed} description={errorCopy()(journey.error) ?? undefined}>
                    <Button kind='tertiary' size='sm' onClick={journey.reload}>{copy.page.retry}</Button>
                </EmptyState>
            );
        }
        if(!journey.data) return <InlineLoading description={copy.page.loading} />;
        if(!journey.data.sessions){
            return (
                <EmptyState
                    icon={Flow}
                    title={start ? copy.page.noneFrom(start) : copy.page.emptyTitle}
                    description={start ? copy.page.noneFromHint : copy.page.emptyHint}
                />
            );
        }
        return <JourneyView journey={journey.data} />;
    };

    return (
        <div className='w-full'>
            <PageHeader title={shared.views.journeys} hint={start ? copy.page.from(start) : undefined}>
                <StartPicker projectId={project.id} value={start} onChange={setStart} />
                <ToolbarMenu label={copy.page.stepsLabel} choices={STEPS} value={steps} onChange={setSteps} />
                <ToolbarMenu label={copy.page.exitsLabel} choices={EXITS} value={exits} onChange={setExits} />
            </PageHeader>

            {body()}
        </div>
    );
};

export default JourneysPage;
