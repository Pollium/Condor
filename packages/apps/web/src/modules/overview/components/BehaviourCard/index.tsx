import { SkeletonText } from '@carbon/react';
import { useQuery } from '@condor/ui/hooks/api/use-query';
import { overviewApi } from '@/modules/overview/api/api';
import Loaded from '@/modules/overview/components/Loaded';
import RangeBars from '@/modules/overview/components/RangeBars';
import Stats from '@/modules/overview/components/Stats';
import Tabbed from '@/modules/overview/components/Tabbed';
import WeekRhythm from '@/modules/overview/components/WeekRhythm';
import { useScope } from '@/modules/overview/hooks/use-scope';
import { copy } from '@/modules/overview/i18n';
import { oneDecimal } from '@/modules/overview/utils/kpis';
import { fmt } from '@/shared/utils/format';

const BehaviourCard = () => {
    const { projectId, period } = useScope();
    const engagement = useQuery(overviewApi.engagement, [projectId, period]);

    return (
        <Tabbed
            title={copy.behaviour.title}
            lead={
                <Loaded query={engagement} skeleton={<SkeletonText heading width='100%' />}>
                    {(data) => (
                        <Stats
                            items={[
                                { label: copy.behaviour.activeTime, value: fmt.duration(data.activeSeconds) },
                                { label: copy.behaviour.scroll, value: fmt.pct(data.scrollDepth) },
                                { label: copy.behaviour.clicksPerSession, value: oneDecimal(data.clicksPerSession) },
                                { label: copy.behaviour.sessionsPerPerson, value: oneDecimal(data.sessionsPerPerson) }
                            ]}
                        />
                    )}
                </Loaded>
            }
            tabs={[
                { id: 'duration', label: copy.behaviour.duration, content: <RangeBars dimension='duration' /> },
                { id: 'depth', label: copy.behaviour.depth, content: <RangeBars dimension='depth' /> },
                { id: 'hours', label: copy.behaviour.hours, content: <WeekRhythm /> }
            ]}
        />
    );
};

export default BehaviourCard;
