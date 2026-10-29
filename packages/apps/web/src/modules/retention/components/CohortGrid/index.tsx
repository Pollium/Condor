import { Tooltip as HintTip } from '@carbon/react';
import { Retention } from '@condor/contracts/retention/domain';
import { cohortLabel, UNIT } from '@/modules/retention/utils/cohort-copy';
import { fmt } from '@/shared/utils/format';
import { heatFill } from '@/shared/utils/heat';

const CohortGrid = ({ retention }: { retention: Retention }) => {
    const unit = UNIT[retention.grain];
    const columns = Math.max(0, ...retention.cohorts.map((cohort) => cohort.values.length));

    return (
        <div className='overflow-x-auto'>
            <div className='grid min-w-[44rem] gap-1' style={{ gridTemplateColumns: `6.5rem 5rem repeat(${columns}, minmax(2.75rem, 1fr))` }}>
                <span className='text-[0.75rem] text-muted'>{unit.column}</span>
                <span className='pr-2 text-right text-[0.75rem] text-muted'>Personas</span>
                {Array.from({ length: columns }, (_, index) => (
                    <span key={index} className='text-center text-[0.75rem] text-muted'>
                        {unit.short}{index}
                    </span>
                ))}
                {retention.cohorts.map((cohort) => (
                    <div key={cohort.start} className='contents'>
                        <span className='flex items-center text-[0.8125rem] text-foreground'>{cohortLabel(cohort.start)}</span>
                        <span className='flex items-center justify-end pr-2 text-[0.8125rem] tabular-nums text-muted'>{fmt.n(cohort.size)}</span>
                        {Array.from({ length: columns }, (_, index) => {
                            const value = cohort.values[index];
                            if(value === undefined) return <span key={index} />;
                            return (
                                <HintTip
                                    key={index}
                                    label={`${fmt.n(Math.round(cohort.size * value))} de ${fmt.n(cohort.size)} personas en ${unit.one} ${index}`}
                                    enterDelayMs={150}
                                    autoAlign
                                    className='min-w-0'
                                >
                                    <span
                                        className={`flex h-9 w-full items-center justify-center text-[0.75rem] tabular-nums ${index === 0 || value >= 0.55 ? 'text-background' : 'text-foreground'}`}
                                        style={{ background: heatFill(value) }}
                                    >
                                        {fmt.pct(value)}
                                    </span>
                                </HintTip>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CohortGrid;
